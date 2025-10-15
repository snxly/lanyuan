"""
Payment data service for lanyuan project.
"""

import json
import os
import requests
import ssl
import urllib3
from datetime import datetime, timedelta
from typing import List, Dict, Any

# 禁用SSL警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class PaymentService:
    """
    缴费数据服务类
    """

    def __init__(self):
        self.payment_data = {
            'targetHouseholds': 0,
            'totalHouseholds': 0,
            'totalAmount': 0,
            'dailyGrowth': 0,
            'maxDay': {'date': '', 'count': 0},
            'minDay': {'date': '', 'count': 0},
            'trendData': [],
            'dailyData': [],
            'recentPayments': [],
            'lastUpdate': None
        }

    def generate_dates_from_oct14_to_jan3(self) -> List[str]:
        """生成从10月14日到1月3日的日期列表"""
        dates = []
        start = datetime(2024, 10, 14)  # 2024年10月14日
        end = datetime(2025, 1, 3)      # 2025年1月3日

        current_date = start
        while current_date <= end:
            month = str(current_date.month).zfill(2)
            day = str(current_date.day).zfill(2)
            dates.append(f"{month}-{day}")
            current_date += timedelta(days=1)

        return dates

    def fetch_payment_data(self) -> List[Dict[str, Any]]:
        """获取缴费数据"""
        try:
            import subprocess
            import json

            headers = {
                'Accept': 'application/json',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ru;q=0.6,de;q=0.5,fr;q=0.4,es;q=0.3',
                'Connection': 'keep-alive',
                'Origin': 'https://open.lsbankchina.com',
                'Referer': 'https://open.lsbankchina.com/jfpt/ent/app/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-I9300 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/5.2.380',
                'b': '1',
                'sec-ch-ua': '""',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '""'
            }

            data = {
                "merchantNo": "803231049005071",
                "themeId": "bafc86455f0acf87ce34ccde4bee7dbc",
                "code": "",
                "uuid": ""
            }

            # 使用curl作为替代方案，因为Python的SSL库有兼容性问题
            curl_cmd = [
                'curl', '-k', '--insecure',
                '-X', 'POST',
                '-H', 'Content-Type: application/json',
                '-H', f'Accept: {headers["Accept"]}',
                '-H', f'Accept-Language: {headers["Accept-Language"]}',
                '-H', f'Origin: {headers["Origin"]}',
                '-H', f'Referer: {headers["Referer"]}',
                '-H', f'User-Agent: {headers["User-Agent"]}',
                '--data', json.dumps(data),
                'https://open.lsbankchina.com/jfpt/ent/app/api/app/control/getFixedCosts'
            ]

            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                response_data = json.loads(result.stdout)
                return response_data.get('data', {}).get('showData', [])
            else:
                print(f'curl请求失败: {result.stderr}')
                return []

        except Exception as e:
            print(f'获取数据失败: {e}')
            return []

    def format_date_to_utc8(self, date=None) -> str:
        """格式化日期为UTC+8"""
        if date is None:
            date = datetime.now()

        # 手动格式化，避免时区问题
        return date.strftime('%Y-%m-%d %H:%M:%S')

    def process_data(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """处理原始数据"""
        if not raw_data:
            return self.payment_data

        # 按日期分组
        payments_by_date = {}
        payment_amounts = []

        # 排序
        sorted_raw_data = sorted(raw_data, key=lambda x: x.get('patTime', ''))

        for payment in sorted_raw_data:
            pat_time = payment.get('patTime', '')
            if not pat_time:
                continue

            date = pat_time.split(' ')[0][5:]  # 获取日期部分
            if date not in payments_by_date:
                payments_by_date[date] = {
                    'count': 0,
                    'amount': 0
                }

            payments_by_date[date]['count'] += 1
            payments_by_date[date]['amount'] += float(payment.get('payAmt', 0))

            payment_amounts.append({
                'date': pat_time.replace('.0', ''),
                'amount': float(payment.get('payAmt', 0))
            })

        # 计算统计数据
        dates = sorted(payments_by_date.keys())
        total_households = len(sorted_raw_data)
        total_amount = int(sum(float(payment.get('payAmt', 0)) for payment in sorted_raw_data) / 10000)

        # 计算每日增长
        daily_growth = 0
        if len(dates) >= 2:
            last_day = dates[-1]
            prev_day = dates[-2]
            daily_growth = payments_by_date[last_day]['count'] - payments_by_date[prev_day]['count']

        # 找到缴费最多和最少的一天
        max_day = {'date': '', 'count': 0}
        min_day = {'date': '', 'count': float('inf')}

        for date, data in payments_by_date.items():
            if data['count'] >= max_day['count']:
                max_day = {'date': date, 'count': data['count']}
            if data['count'] <= min_day['count']:
                min_day = {'date': date, 'count': data['count']}

        # 生成每日数据
        all_dates = self.generate_dates_from_oct14_to_jan3()
        daily_counts = []
        trend_counts = []

        trend_count = 0
        for date in all_dates:
            daily_count = payments_by_date.get(date, {}).get('count', 0)
            trend_count += daily_count
            daily_counts.append(daily_count)
            trend_counts.append(trend_count)

        daily_data = {
            'dates': all_dates,
            'dailyCounts': [{
                'name': '2024',
                'data': daily_counts,
            }],
            'trendCounts': [{
                'name': '2024',
                'data': trend_counts,
            }],
        }

        # 最近缴费记录
        recent_payments = sorted(payment_amounts, key=lambda x: x['date'], reverse=True)[:10]

        # 计算进度百分比
        target_households = 607
        progress_percent = min((total_households / target_households) * 100, 100)

        # 计算日增长百分比
        daily_growth_percent = (abs(daily_growth) / total_households * 100) if total_households > 0 else 0

        # 格式化日期
        def format_date(date_str):
            if not date_str:
                return ''
            try:
                # 假设日期格式为 MM-DD
                parts = date_str.split('-')
                if len(parts) == 2:
                    return f"{parts[0]}.{parts[1]}"
                return date_str
            except:
                return date_str

        return {
            'targetHouseholds': target_households,
            'totalHouseholds': total_households,
            'totalAmount': total_amount,
            'dailyGrowth': daily_growth,
            'maxDay': {
                **max_day,
                'formattedDate': format_date(max_day['date'])
            },
            'minDay': {
                **min_day,
                'formattedDate': format_date(min_day['date'])
            },
            'dailyData': daily_data,
            'recentPayments': recent_payments,
            'progressPercent': round(progress_percent, 1),
            'dailyGrowthPercent': round(daily_growth_percent, 1),
            'lastUpdate': self.format_date_to_utc8(),
        }

    def read_2024_data(self) -> List[Dict[str, Any]]:
        """读取2024年数据"""
        try:
            file_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'lanyuan-2024.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                print('lanyuan-2024.json 读取成功')
                arr = raw_data.get('data', {}).get('showData', [])
                # 测试用，随机删掉 1/3 的数据
                result = self.remove_some_data(arr)
                return result
            else:
                print('lanyuan-2024.json 文件不存在')
                return []
        except Exception as e:
            print(f'读取lanyuan-2024.json文件失败: {e}')
            return []

    def remove_some_data(self, arr: List[Any]) -> List[Any]:
        """随机删除部分数据"""
        import random
        remove_count = len(arr) // 3
        marked_for_removal = set()

        # 随机选择要删除的索引
        while len(marked_for_removal) < remove_count:
            random_index = random.randint(0, len(arr) - 1)
            marked_for_removal.add(random_index)

        # 过滤掉被标记的元素
        return [item for index, item in enumerate(arr) if index not in marked_for_removal]

    def get_dashboard_data(self) -> Dict[str, Any]:
        """获取仪表板数据"""
        # 这里可以添加缓存逻辑
        return self.payment_data

    def update_payment_data(self, data: Dict[str, Any]):
        """更新缴费数据"""
        self.payment_data = data


# 创建全局实例
payment_service = PaymentService()