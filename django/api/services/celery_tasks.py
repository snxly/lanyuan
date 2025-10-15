"""
Celery定时任务配置
"""

from celery.schedules import crontab


# 定时任务配置
CELERY_BEAT_SCHEDULE = {
    'fetch-payment-data-every-5-minutes': {
        'task': 'api.tasks.fetch_and_process_payment_data',
        'schedule': crontab(minute='*/5'),  # 每5分钟执行一次
        'options': {'queue': 'default'}
    },
}