# 生产环境配置说明

## ⚠️ 重要提醒

当前项目配置为**测试模式**，以下设置需要调整后才能用于生产环境：

### 1. 定时任务间隔
**当前**：1分钟（测试模式）
**生产环境**：建议改为5分钟

修改 `payment_service/settings.py`：
```python
# Scheduler Configuration
SCHEDULER_INTERVAL_MINUTES = 5  # 生产环境建议5分钟
```

### 2. 调试模式
**当前**：DEBUG = True
**生产环境**：必须设置为 False

修改 `payment_service/settings.py`：
```python
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
```

### 3. 数据库配置
**当前**：使用SQLite（测试模式）
**生产环境**：使用MySQL

修改 `payment_service/settings.py` 中的数据库配置：
```python
# 生产环境使用MySQL
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': os.getenv('DB_NAME', 'lanyuan'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'Weixin000'),
        'HOST': os.getenv('DB_HOST', 'sh-cynosdbmysql-grp-a43bwiag.sql.tencentcdb.com'),
        'PORT': os.getenv('DB_PORT', '27487'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'use_pure': True,
            'connect_timeout': 30,
            'connection_timeout': 30,
        },
    }
}
```

### 4. 安全密钥
**当前**：使用默认密钥
**生产环境**：必须设置强密钥

通过环境变量设置：
```bash
DJANGO_SECRET_KEY=your-very-secure-secret-key-here
```

### 5. 允许的主机
**当前**：localhost,127.0.0.1
**生产环境**：配置实际域名

通过环境变量设置：
```bash
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

## 🚀 生产部署步骤

1. **配置环境变量**：创建 `.env` 文件并设置所有必要参数
2. **切换数据库**：修改settings.py使用MySQL
3. **禁用调试模式**：设置 `DEBUG=False`
4. **调整定时任务**：改为5分钟间隔
5. **部署到服务器**：使用Docker或传统部署方式

## 📋 环境变量清单

生产环境需要配置的环境变量：
```bash
# Django配置
DEBUG=False
DJANGO_SECRET_KEY=your-secure-secret-key
ALLOWED_HOSTS=your-domain.com

# 数据库配置
DB_NAME=lanyuan
DB_USER=root
DB_PASSWORD=Weixin000
DB_HOST=sh-cynosdbmysql-grp-a43bwiag.sql.tencentcdb.com
DB_PORT=27487

# API配置
API_BASE_URL=https://open.lsbankchina.com/jfpt/ent/app/api/app/control
API_TIMEOUT=30
API_RETRY_COUNT=3
API_RETRY_DELAY=1

# 定时任务配置
SCHEDULER_INTERVAL_MINUTES=5
```

## 🔒 安全建议

- 定期更换数据库密码
- 使用HTTPS协议
- 配置防火墙规则
- 定期备份数据
- 监控服务器资源使用情况