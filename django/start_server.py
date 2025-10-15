"""
启动脚本 - 用于启动Django开发服务器
"""

import os
import sys
import subprocess
import time


def start_redis():
    """启动Redis服务"""
    try:
        # 检查Redis是否已经在运行
        result = subprocess.run(['redis-cli', 'ping'], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip() == 'PONG':
            print('Redis服务已经在运行')
            return True

        # 尝试启动Redis
        print('正在启动Redis服务...')
        subprocess.Popen(['redis-server'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)

        # 检查Redis是否启动成功
        result = subprocess.run(['redis-cli', 'ping'], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip() == 'PONG':
            print('Redis服务启动成功')
            return True
        else:
            print('Redis服务启动失败，请确保Redis已安装并配置正确')
            return False

    except Exception as e:
        print(f'启动Redis服务时出错: {e}')
        print('请确保Redis已安装并配置正确')
        return False


def start_celery_worker():
    """启动Celery Worker"""
    print('正在启动Celery Worker...')
    subprocess.Popen([
        'celery', '-A', 'lanyuan', 'worker',
        '--loglevel=info',
        '--concurrency=1'
    ])
    time.sleep(2)
    print('Celery Worker启动完成')


def start_celery_beat():
    """启动Celery Beat"""
    print('正在启动Celery Beat...')
    subprocess.Popen([
        'celery', '-A', 'lanyuan', 'beat',
        '--loglevel=info',
        '--scheduler', 'django_celery_beat.schedulers:DatabaseScheduler'
    ])
    time.sleep(2)
    print('Celery Beat启动完成')


def start_django_server():
    """启动Django开发服务器"""
    print('正在启动Django开发服务器...')
    os.system('python manage.py runserver 0.0.0.0:8000')


def main():
    """主函数"""
    print('正在启动兰园小区供暖缴费数据后端服务...')

    # 切换到项目目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # 检查依赖
    print('检查依赖...')
    try:
        import django
        import celery
        import redis
        print('依赖检查通过')
    except ImportError as e:
        print(f'依赖检查失败: {e}')
        print('请先安装依赖: pip install -r requirements.txt')
        return

    # 数据库迁移
    print('执行数据库迁移...')
    os.system('python manage.py migrate')

    # 启动Redis
    if not start_redis():
        print('无法启动Redis服务，请手动启动Redis后重新运行此脚本')
        return

    # 启动Celery Worker
    start_celery_worker()

    # 启动Celery Beat
    start_celery_beat()

    # 启动Django服务器
    start_django_server()


if __name__ == '__main__':
    main()