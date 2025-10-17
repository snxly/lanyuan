# Django MySQL 缴费服务

基于 Django 和 MySQL 的缴费数据跟踪服务，提供定时数据更新和 Dashboard API 接口。

## 功能特性

- 🏠 **房间号自动生成**：根据规则生成所有房间号
- 🔄 **定时数据更新**：每5分钟自动更新缴费数据
- 📊 **Dashboard API**：提供完整的统计数据和图表数据
- 🐳 **Docker 部署**：支持微信云托管部署
- 🔒 **数据安全**：客户信息单独存储

## 项目结构

```
django-mysql/
├── payment_service/          # Django 项目配置
├── payment_app/              # 主应用
│   ├── models.py            # 数据模型
│   ├── views.py             # API 视图
│   ├── tasks.py             # 定时任务
│   ├── services/            # 业务服务
│   └── management/commands/ # 管理命令
├── manage.py                # Django 管理脚本
├── Dockerfile               # Docker 配置
├── docker-compose.yml       # Docker Compose 配置
├── pyproject.toml          # Python 依赖配置
└── README.md               # 项目说明
```

## 快速开始

### 环境要求

- Python 3.8+
- MySQL 5.7+
- uv (Python 包管理器)

### 安装依赖

```bash
# 使用 uv 安装依赖
uv pip install -r <(uv pip compile pyproject.toml)
```

### 配置环境变量

复制环境变量模板并配置：

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 数据库迁移

```bash
# 创建数据库迁移文件
python manage.py makemigrations

# 应用数据库迁移
python manage.py migrate
```

### 运行服务

#### 开发模式

```bash
# 启动开发服务器
python manage.py runserver

# 手动运行一次数据更新任务
python manage.py run_task_once

# 启动定时任务调度器
python manage.py run_scheduler
```

#### Docker 部署

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## API 接口

### Dashboard API

**GET** `/api/dashboard`

返回前端需要的所有统计数据，包括：

- `targetHouseholds`: 目标缴费用户数 (607)
- `totalHouseholds`: 当前缴费总户数
- `totalAmount`: 当前缴费总金额（万元）
- `dailyGrowth`: 当日缴费用户数
- `dailyGrowthPercent`: 当日缴费用户占比
- `progressPercent`: 完成进度百分比
- `maxDay`/`minDay`: 缴费最多/最少日统计
- `dailyData`: 每日缴费趋势数据
- `recentPayments`: 最近缴费记录
- `lastUpdate`: 最后更新时间

## 定时任务

系统每5分钟自动执行以下任务：

1. **生成房间号**：根据规则生成所有房间号
2. **API 轮询**：调用外部接口获取缴费信息
3. **数据保存**：将结果保存到 MySQL 数据库

### 手动运行任务

```bash
python manage.py run_task_once
```

## 数据库设计

### 表结构

- **customer_info**: 客户信息表
- **room_info**: 房间信息表
- **payment_info**: 缴费信息表

### 数据迁移

提供 SQL 脚本用于数据库结构创建和客户信息分离。

## 部署说明

### 微信云托管

1. 配置环境变量
2. 构建 Docker 镜像
3. 部署到微信云托管

### 传统部署

1. 安装 Python 依赖
2. 配置环境变量
3. 运行数据库迁移
4. 启动 Gunicorn 服务器
5. 启动定时任务调度器

## 开发说明

### 添加新的楼栋配置

在 `payment_app/services/room_generator.py` 中的 `building_configs` 添加新的配置。

### 自定义 API 参数

在 `payment_app/services/api_client.py` 中修改 API 请求参数。

### 调整定时任务频率

在 `payment_service/settings.py` 中修改 `SCHEDULER_INTERVAL_MINUTES`。

## 故障排除

### 常见问题

1. **数据库连接失败**：检查环境变量配置
2. **API 请求失败**：检查网络连接和 API 服务状态
3. **定时任务不执行**：检查调度器是否正常运行

### 日志查看

```bash
# 查看应用日志
docker-compose logs web

# 查看调度器日志
docker-compose logs scheduler
```

## 许可证

MIT License