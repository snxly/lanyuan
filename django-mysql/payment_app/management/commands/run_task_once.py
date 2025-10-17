"""
Django管理命令 - 手动运行一次定时任务
"""
from django.core.management.base import BaseCommand
from ...tasks import PaymentTask


class Command(BaseCommand):
    help = '手动运行一次缴费数据更新任务'

    def handle(self, *args, **options):
        """手动运行任务"""
        self.stdout.write(
            self.style.SUCCESS('开始手动执行缴费数据更新任务...')
        )

        task = PaymentTask()
        result = task.run_task_with_progress(batch_size=50, max_workers=10)

        self.stdout.write(
            self.style.SUCCESS(
                f'任务执行完成: 总计 {result["total"]}, '
                f'成功 {result["success"]}, '
                f'失败 {result["error"]}, '
                f'已缴费 {result["paid"]}, '
                f'耗时 {result["execution_time"]:.2f}秒'
            )
        )