"""
Celery tasks for lanyuan project.
"""

from celery import shared_task
from .services.payment_service import payment_service


@shared_task
def fetch_and_process_payment_data():
    """
    获取并处理缴费数据的定时任务
    """
    print('开始获取数据...')

    # 获取数据
    raw_data = payment_service.fetch_payment_data()

    # 处理数据
    processed_data = payment_service.process_data(raw_data)

    # 更新数据
    payment_service.update_payment_data(processed_data)

    print('完成定时任务, 数据更新完成1', processed_data)
    return True