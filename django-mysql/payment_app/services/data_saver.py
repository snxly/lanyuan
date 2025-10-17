"""
数据保存器 - 将API数据保存到数据库
"""
import logging
from typing import Dict, List
from django.db import transaction
from ..models import RoomInfo, CustomerInfo, PaymentInfo

logger = logging.getLogger(__name__)


class DataSaver:
    """数据保存器"""

    def __init__(self):
        self.processed_count = 0
        self.error_count = 0

    def save_room_data(self, parsed_data: Dict) -> bool:
        """
        保存房间数据到数据库

        Args:
            parsed_data: 解析后的数据

        Returns:
            是否成功保存
        """
        try:
            with transaction.atomic():
                # 解析房间号
                room_number = parsed_data['room_number']
                building, unit, room = room_number.split('-')

                # 查找或创建客户信息
                customer = None
                if parsed_data.get('customer_name'):
                    customer, created = CustomerInfo.objects.get_or_create(
                        customer_name=parsed_data['customer_name']
                    )
                    if created:
                        logger.debug(f"创建新客户: {parsed_data['customer_name']}")

                # 查找或创建房间信息
                room_info, created = RoomInfo.objects.get_or_create(
                    building_number=building,
                    unit_number=unit,
                    room_number=room,
                    defaults={
                        'floor_area': parsed_data.get('floor_area'),
                        'customer': customer
                    }
                )

                # 如果房间已存在，更新信息
                if not created:
                    if parsed_data.get('floor_area') and not room_info.floor_area:
                        room_info.floor_area = parsed_data['floor_area']
                    if customer and not room_info.customer:
                        room_info.customer = customer
                    room_info.save()

                # 处理缴费信息
                if parsed_data['payment_type'] == '1':  # 已缴费
                    payment_year = self._extract_year_from_date(parsed_data.get('payment_time'))
                    if payment_year:
                        payment_info, created = PaymentInfo.objects.get_or_create(
                            room=room_info,
                            payment_year=payment_year,
                            defaults={
                                'payment_amount': parsed_data.get('payment_amount'),
                                'payment_order_number': parsed_data.get('payment_order_number'),
                                'payment_time': parsed_data.get('payment_time')
                            }
                        )

                        if not created:
                            # 更新现有缴费记录
                            if parsed_data.get('payment_amount'):
                                payment_info.payment_amount = parsed_data['payment_amount']
                            if parsed_data.get('payment_order_number'):
                                payment_info.payment_order_number = parsed_data['payment_order_number']
                            if parsed_data.get('payment_time'):
                                payment_info.payment_time = parsed_data['payment_time']
                            payment_info.save()

                self.processed_count += 1
                return True

        except Exception as e:
            logger.error(f"保存房间数据失败: {parsed_data['room_number']} - {e}")
            self.error_count += 1
            return False

    def _extract_year_from_date(self, date_str: str) -> int:
        """从日期字符串中提取年份"""
        if not date_str:
            return None

        try:
            # 处理格式如 "2024-10-14 14:58:23.0"
            year_str = date_str.split('-')[0]
            return int(year_str)
        except (ValueError, IndexError):
            logger.warning(f"无法从日期字符串提取年份: {date_str}")
            return None

    def batch_save_room_data(self, parsed_data_list: List[Dict]) -> Dict:
        """
        批量保存房间数据

        Args:
            parsed_data_list: 解析后的数据列表

        Returns:
            统计信息
        """
        success_count = 0
        error_count = 0

        for data in parsed_data_list:
            if self.save_room_data(data):
                success_count += 1
            else:
                error_count += 1

        stats = {
            'total': len(parsed_data_list),
            'success': success_count,
            'error': error_count
        }

        logger.info(f"批量保存完成: 总计 {stats['total']}, 成功 {stats['success']}, 失败 {stats['error']}")
        return stats