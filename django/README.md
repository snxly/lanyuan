# 兰园小区供暖缴费数据后端服务 (Django版本)

基于Django和Python的兰园小区供暖缴费数据后端服务，提供与Express版本相同的功能。

## 功能特性

- 定时获取缴费数据（每5分钟）
- 数据统计和分析
- RESTful API接口
- 支持CORS跨域请求
- 使用Celery处理定时任务

## 项目结构

```
django/
├── lanyuan/                 # Django项目配置
│   ├── __init__.py
│   ├── settings.py          # 项目设置
│   ├── urls.py             # URL路由
│   ├── wsgi.py             # WSGI配置
│   └── celery.py           # Celery配置
├── api/                    # API应用
│   ├── __init__.py
│   ├── apps.py
│   ├── urls.py            # API路由
│   ├── views.py           # API视图
│   ├── tasks.py           # Celery任务
│   └── services/          # 业务逻辑服务
│       ├── __init__.py
│       └── payment_service.py  # 缴费数据服务
├── manage.py              # Django管理脚本
├── requirements.txt       # Python依赖
├── start_server.py        # 启动脚本
└── README.md             # 说明文档
```

## 安装和运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 数据库迁移

```bash
python manage.py migrate
```

### 3. 启动服务

使用启动脚本（推荐）：
```bash
python start_server.py
```

或手动启动：
```bash
# 启动Redis（需要先安装Redis，可选）
redis-server

# 启动Celery Worker（如果Redis已安装）
celery -A lanyuan worker --loglevel=info

# 启动Celery Beat（如果Redis已安装）
celery -A lanyuan beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# 启动Django开发服务器
python manage.py runserver 0.0.0.0:8000
```

### 关于Redis

Redis是可选的依赖：
- **有Redis**：定时任务功能正常，数据每5分钟自动更新
- **无Redis**：API接口仍可正常使用，但定时任务功能不可用

**注意**: 启动脚本会自动检测Redis服务状态，如果Redis未运行，会尝试多种方式启动。如果Redis无法启动，API接口仍可正常使用，但定时任务功能将不可用。

## API接口

### 获取仪表板数据

```http
GET /api/dashboard/
```

响应示例：
```json
{
  "success": true,
  "data": {
    "targetHouseholds": 607,
    "totalHouseholds": 450,
    "totalAmount": 120,
    "dailyGrowth": 15,
    "maxDay": {
      "date": "12-25",
      "count": 45,
      "formattedDate": "12.25"
    },
    "minDay": {
      "date": "10-15",
      "count": 2,
      "formattedDate": "10.15"
    },
    "dailyData": {
      "dates": ["10-14", "10-15", ...],
      "dailyCounts": [{
        "name": "2024",
        "data": [5, 10, ...]
      }],
      "trendCounts": [{
        "name": "2024",
        "data": [5, 15, ...]
      }]
    },
    "recentPayments": [
      {
        "date": "2024-12-25 10:30:00",
        "amount": 2500.0
      }
    ],
    "progressPercent": 74.1,
    "dailyGrowthPercent": 3.3,
    "lastUpdate": "2024-12-25 15:30:00"
  }
}
```

## 定时任务

- **数据获取任务**：每5分钟自动获取最新的缴费数据
- **数据处理任务**：实时处理获取的数据并更新缓存

## 配置说明

### 环境变量

- `DEBUG`: 调试模式开关
- `SECRET_KEY`: Django密钥
- `CELERY_BROKER_URL`: Celery消息代理URL

### 数据库

默认使用SQLite数据库，可根据需要配置其他数据库。

## 与原Express版本的对比

| 特性 | Express版本 | Django版本 |
|------|-------------|-------------|
| 框架 | Node.js/Express | Python/Django |
| 定时任务 | node-cron | Celery |
| API风格 | RESTful | RESTful |
| 数据缓存 | 内存变量 | 内存变量 |
| 跨域支持 | cors中间件 | django-cors-headers |
| 部署方式 | PM2 | Gunicorn + Nginx |

## 开发说明

- 项目使用Django REST Framework构建API
- 使用Celery处理异步任务和定时任务
- 支持热重载开发
- 包含完整的错误处理机制

## 部署

生产环境部署建议：

1. 使用Gunicorn作为WSGI服务器
2. 使用Nginx作为反向代理
3. 配置Redis作为Celery消息代理
4. 使用PostgreSQL作为生产数据库
5. 配置环境变量和日志管理