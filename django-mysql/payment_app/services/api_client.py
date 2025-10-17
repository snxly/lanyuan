"""
API客户端 - 用于调用外部接口获取缴费信息
"""
import json
import time
import logging
import requests
from typing import Dict, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class APIClient:
    """API客户端"""

    def __init__(self):
        self.base_url = settings.API_BASE_URL
        self.timeout = settings.API_TIMEOUT
        self.retry_count = settings.API_RETRY_COUNT
        self.retry_delay = settings.API_RETRY_DELAY

        self.headers = {
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ru;q=0.6,de;q=0.5,fr;q=0.4,es;q=0.3',
            'Authorization': '',
            'Connection': 'keep-alive',
            'Origin': 'https://open.lsbankchina.com',
            'Referer': 'https://open.lsbankchina.com/jfpt/ent/app/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'b': '1',
            'content-type': 'application/json;charset=UTF-8',
            'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        }

    def get_payment_info(self, room_number: str) -> Optional[Dict]:
        """
        获取房间缴费信息

        Args:
            room_number: 房间号，格式如 "3-1-302"

        Returns:
            缴费信息字典，失败返回None
        """
        payload = {
            "merchantNo": "803231049005071",
            "themeId": "bafc86455f0acf87ce34ccde4bee7dbc",
            "fanghao": room_number,
            "code": "",
            "uuid": ""
        }

        for attempt in range(self.retry_count):
            try:
                response = requests.post(
                    f"{self.base_url}/getFixedCosts",
                    headers=self.headers,
                    data=json.dumps(payload),
                    timeout=self.timeout
                )

                if response.status_code == 200:
                    data = response.json()

                    if data.get('code') == 200:
                        return data.get('data')
                    else:
                        logger.warning(f"API返回错误: {data.get('message')} - 房间号: {room_number}")
                        return None
                else:
                    logger.warning(f"HTTP错误: {response.status_code} - 房间号: {room_number}")

            except requests.exceptions.RequestException as e:
                logger.warning(f"请求异常 (尝试 {attempt + 1}/{self.retry_count}): {e} - 房间号: {room_number}")

            # 重试前等待
            if attempt < self.retry_count - 1:
                time.sleep(self.retry_delay)

        logger.error(f"所有重试失败: {room_number}")
        return None

    def parse_payment_data(self, room_number: str, api_data: Dict) -> Dict:
        """
        解析API返回的缴费数据

        Args:
            room_number: 房间号
            api_data: API返回的数据

        Returns:
            解析后的数据字典
        """
        result = {
            'room_number': room_number,
            'payment_type': api_data.get('type'),
            'floor_area': None,
            'customer_name': None,
            'payment_amount': None,
            'payment_order_number': None,
            'payment_time': None
        }

        # 根据type处理不同数据
        if api_data.get('type') == '1':  # 已缴费
            show_data = api_data.get('showData', [])
            if show_data:
                payment_data = show_data[0]
                result.update({
                    'payment_amount': payment_data.get('payAmt'),
                    'payment_order_number': payment_data.get('payNo'),
                    'payment_time': payment_data.get('patTime')
                })

        elif api_data.get('type') == '0':  # 未缴费
            # 从showData中提取信息
            for item in api_data.get('showData', []):
                key = item.get('key')
                if key == 'jjmj':  # 建筑面积
                    result['floor_area'] = item.get('jjmj')
                elif key == 'username':  # 客户名称
                    result['customer_name'] = item.get('username')

            # 从顶层字段获取信息
            if not result['floor_area']:
                result['floor_area'] = api_data.get('jjmj')
            if not result['customer_name']:
                result['customer_name'] = api_data.get('username')

        return result