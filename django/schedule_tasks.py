"""
使用schedule库实现的定时任务
"""
import schedule
import time
import threading
from api.services.payment_service import payment_service


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

    print('数据更新完成', processed_data['lastUpdate'])
    return True


def run_scheduler():
    """运行定时任务调度器"""
    print('启动定时任务调度器...')

    # 每5分钟执行一次
    schedule.every(1).minutes.do(fetch_and_process_payment_data)

    # 立即执行一次
    # fetch_and_process_payment_data()

    while True:
        schedule.run_pending()
        time.sleep(1)


def start_schedule_in_background():
    """在后台线程中启动定时任务"""
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    print('定时任务调度器已在后台启动')
    return scheduler_thread