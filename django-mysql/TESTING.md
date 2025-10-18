# 测试指南

## 🚀 定时任务已调整为1分钟间隔

为了便于测试，已将定时任务执行间隔从5分钟调整为1分钟。

### 启动测试

#### 1. 启动API服务器
```bash
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

#### 2. 启动定时任务调度器
```bash
source .venv/bin/activate
python manage.py run_scheduler
```

### 测试API接口

#### Dashboard API
- URL: `http://localhost:8000/api/dashboard/` (带斜杠)
- URL: `http://localhost:8000/api/dashboard` (无斜杠)

#### 手动运行任务
```bash
source .venv/bin/activate
python manage.py run_task_once
```

### 预期行为

1. **定时任务**：每1分钟自动执行一次
2. **API数据**：Dashboard会显示更新的缴费数据
3. **日志输出**：调度器会显示任务执行状态

### 监控日志

查看调度器日志以确认任务执行：
```
开始执行定时缴费数据更新任务...
需要处理 X 个房间，批次大小: 50
处理批次 1/N: 房间 1-50
...
定时任务执行完成: 总计 X, 成功 Y, 失败 Z, 已缴费 W, 耗时 T秒
```

### 注意事项

- 测试完成后，建议将 `SCHEDULER_INTERVAL_MINUTES` 改回5分钟
- 生产环境应使用 `DEBUG = False`
- 定时任务会调用外部API，请确保网络连接正常