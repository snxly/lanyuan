"""
定时任务 - 每5分钟执行一次的房间数据更新任务
"""
import time
import logging
import concurrent.futures
from typing import List, Dict
from django.conf import settings
from .services.room_generator import RoomNumberGenerator
from .services.api_client import APIClient
from .services.data_saver import DataSaver

logger = logging.getLogger(__name__)


class PaymentTask:
    """缴费数据更新任务"""

    def __init__(self):
        self.room_generator = RoomNumberGenerator()
        self.api_client = APIClient()
        self.data_saver = DataSaver()

    def process_single_room(self, room_number: str) -> Dict:
        """
        处理单个房间

        Args:
            room_number: 房间号

        Returns:
            处理结果
        """
        try:
            # 获取API数据
            api_data = self.api_client.get_payment_info(room_number)
            if api_data is None:
                return {
                    'room_number': room_number,
                    'success': False,
                    'error': 'API请求失败'
                }

            # 解析数据
            parsed_data = self.api_client.parse_payment_data(room_number, api_data)

            # 保存数据
            success = self.data_saver.save_room_data(parsed_data)

            return {
                'room_number': room_number,
                'success': success,
                'payment_type': parsed_data.get('payment_type')
            }

        except Exception as e:
            logger.error(f"处理房间失败: {room_number} - {e}")
            return {
                'room_number': room_number,
                'success': False,
                'error': str(e)
            }

    def run_task(self, max_workers: int = 10, delay_between_requests: float = 0.1):
        """
        运行定时任务

        Args:
            max_workers: 最大并发工作线程数
            delay_between_requests: 请求间延迟（秒）
        """
        logger.info("开始执行定时任务...")
        start_time = time.time()

        # 生成所有房间号
        room_numbers = self.room_generator.generate_all_room_numbers()
        logger.info(f"需要处理 {len(room_numbers)} 个房间")

        # 使用线程池并发处理
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交所有任务
            future_to_room = {
                executor.submit(self.process_single_room, room): room
                for room in room_numbers
            }

            # 收集结果
            for future in concurrent.futures.as_completed(future_to_room):
                room_number = future_to_room[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"处理房间异常: {room_number} - {e}")
                    results.append({
                        'room_number': room_number,
                        'success': False,
                        'error': str(e)
                    })

                # 添加延迟以减轻服务器压力
                time.sleep(delay_between_requests)

        # 统计结果
        success_count = sum(1 for r in results if r.get('success'))
        error_count = len(results) - success_count
        paid_count = sum(1 for r in results if r.get('payment_type') == '1')

        execution_time = time.time() - start_time

        logger.info(f"定时任务完成: "
                   f"总计 {len(results)}, "
                   f"成功 {success_count}, "
                   f"失败 {error_count}, "
                   f"已缴费 {paid_count}, "
                   f"耗时 {execution_time:.2f}秒")

        return {
            'total': len(results),
            'success': success_count,
            'error': error_count,
            'paid': paid_count,
            'execution_time': execution_time
        }

    def run_task_with_progress(self, batch_size: int = 50, max_workers: int = 10):
        """
        带进度显示的批量任务执行

        Args:
            batch_size: 批次大小
            max_workers: 最大并发工作线程数
        """
        logger.info("开始执行带进度的定时任务...")
        start_time = time.time()

        # 生成所有房间号
        room_numbers = self.room_generator.generate_all_room_numbers()
        total_rooms = len(room_numbers)

        logger.info(f"需要处理 {total_rooms} 个房间，批次大小: {batch_size}")

        # 分批处理
        all_results = []
        for i in range(0, total_rooms, batch_size):
            batch = room_numbers[i:i + batch_size]
            logger.info(f"处理批次 {i//batch_size + 1}/{(total_rooms + batch_size - 1)//batch_size}: "
                       f"房间 {i+1}-{min(i+batch_size, total_rooms)}")

            batch_results = []
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                future_to_room = {
                    executor.submit(self.process_single_room, room): room
                    for room in batch
                }

                for future in concurrent.futures.as_completed(future_to_room):
                    room_number = future_to_room[future]
                    try:
                        result = future.result()
                        batch_results.append(result)
                    except Exception as e:
                        logger.error(f"处理房间异常: {room_number} - {e}")
                        batch_results.append({
                            'room_number': room_number,
                            'success': False,
                            'error': str(e)
                        })

            all_results.extend(batch_results)

            # 批次间延迟
            time.sleep(1)

        # 统计结果
        success_count = sum(1 for r in all_results if r.get('success'))
        error_count = len(all_results) - success_count
        paid_count = sum(1 for r in all_results if r.get('payment_type') == '1')

        execution_time = time.time() - start_time

        logger.info(f"带进度任务完成: "
                   f"总计 {len(all_results)}, "
                   f"成功 {success_count}, "
                   f"失败 {error_count}, "
                   f"已缴费 {paid_count}, "
                   f"耗时 {execution_time:.2f}秒")

        return {
            'total': len(all_results),
            'success': success_count,
            'error': error_count,
            'paid': paid_count,
            'execution_time': execution_time
        }