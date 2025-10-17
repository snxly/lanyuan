"""
Django管理命令 - 启动定时任务调度器
"""
import logging
from django.core.management.base import BaseCommand
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings
from ...tasks import PaymentTask

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '启动定时任务调度器'

    def handle(self, *args, **options):
        """启动调度器"""
        self.stdout.write(
            self.style.SUCCESS('启动定时任务调度器...')
        )

        # 创建调度器
        scheduler = BackgroundScheduler()

        # 添加定时任务
        scheduler.add_job(
            self._run_payment_task,
            trigger=IntervalTrigger(minutes=settings.SCHEDULER_INTERVAL_MINUTES),
            id='payment_task',
            name='缴费数据更新任务',
            replace_existing=True
        )

        # 启动调度器
        scheduler.start()

        self.stdout.write(
            self.style.SUCCESS(
                f'调度器已启动，每{settings.SCHEDULER_INTERVAL_MINUTES}分钟执行一次'
            )
        )

        try:
            # 保持程序运行
            while True:
                pass
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write(self.style.WARNING('停止调度器...'))
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('调度器已停止'))

    def _run_payment_task(self):
        """执行缴费数据更新任务"""
        try:
            logger.info("开始执行定时缴费数据更新任务...")
            task = PaymentTask()
            result = task.run_task_with_progress(batch_size=50, max_workers=10)
            logger.info(f"定时任务执行完成: {result}")
        except Exception as e:
            logger.error(f"定时任务执行失败: {e}")


class ManualTaskRunner:
    """手动任务运行器"""

    @staticmethod
    def run_once():
        """手动运行一次任务"""
        logger.info("手动执行缴费数据更新任务...")
        task = PaymentTask()
        result = task.run_task_with_progress(batch_size=50, max_workers=10)
        logger.info(f"手动任务执行完成: {result}")
        return result