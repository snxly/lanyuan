"""
启动脚本 - 用于启动Django开发服务器
"""

import os
import sys
import subprocess
import time
from schedule_tasks import start_schedule_in_background


def start_django_server():
    """启动Django开发服务器"""
    print('正在启动Django开发服务器...')
    # 设置Django环境变量
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lanyuan.settings')

    # 直接导入并启动Django服务器
    import django
    django.setup()

    from django.core.management import execute_from_command_line
    # 使用use_reloader=False避免文件变化时重新加载导致重复启动
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000', '--noreload'])


def main():
    """主函数"""
    print('正在启动兰园小区供暖缴费数据后端服务...')

    # 切换到项目目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # 检查依赖
    print('检查依赖...')
    try:
        import django
        import schedule
        print('依赖检查通过')
    except ImportError as e:
        print(f'依赖检查失败: {e}')
        print('请先安装依赖: pip install -r requirements.txt')
        return

    # 数据库迁移
    print('执行数据库迁移...')
    os.system('python manage.py migrate')

    # 启动定时任务
    print('启动定时任务...')
    start_schedule_in_background()

    # 立即执行一次数据更新，确保有初始数据
    print('执行初始数据更新...')
    from schedule_tasks import fetch_and_process_payment_data
    fetch_and_process_payment_data()

    # 启动Django服务器
    start_django_server()


if __name__ == '__main__':
    main()