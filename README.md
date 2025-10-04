# 兰园小区供暖缴费数据看板

## 项目概述

这是一个用于监控兰园小区供暖缴费进度的小程序项目，包含后端服务和微信小程序前端。

## 项目结构

```
lanyuan-1/
├── backend/                 # 后端服务
│   ├── package.json        # 后端依赖配置
│   └── server.js           # 后端主程序
├── miniprogram/            # 微信小程序前端
│   ├── app.json            # 小程序配置
│   ├── app.js              # 小程序入口
│   ├── app.wxss            # 全局样式
│   ├── pages/              # 页面文件
│   │   ├── dashboard/      # 数据看板页
│   │   ├── records/        # 缴费记录页
│   │   └── profile/        # 个人中心页
│   ├── sitemap.json        # 搜索索引配置
│   └── project.config.json # 项目配置
├── prd.md                  # 产品需求文档
└── proto.html              # 原型设计
```

## 功能特性

### 后端服务
- 每5分钟自动获取源数据
- 数据预处理和统计分析
- 提供RESTful API接口
- 支持跨域请求

### 微信小程序
- **数据看板**: 显示缴费总户数、总金额、增长趋势等关键指标
- **趋势图表**: 展示缴费户数趋势和每日缴费情况
- **缴费记录**: 查看详细的缴费记录列表
- **个人中心**: 用户信息管理和应用设置

## 快速开始

### 后端服务启动

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 启动服务
```bash
npm start
```

服务将在 http://localhost:3000 启动

### 微信小程序开发

1. 使用微信开发者工具打开 `miniprogram` 目录
2. 配置项目信息
3. 在开发者工具中预览和调试

## API接口

### 获取看板数据
```
GET /api/dashboard
```

响应示例:
```json
{
  "success": true,
  "data": {
    "totalHouseholds": 1842,
    "totalAmount": 4680000,
    "dailyGrowth": 126,
    "maxDay": {
      "date": "2023-10-15",
      "count": 208
    },
    "minDay": {
      "date": "2023-09-05",
      "count": 32
    },
    "trendData": [...],
    "dailyData": [...],
    "recentPayments": [...],
    "lastUpdate": "2023-11-05T14:30:00.000Z"
  }
}
```

## 技术栈

### 后端
- Node.js
- Express.js
- Axios
- Node-cron
- CORS

### 前端
- 微信小程序原生框架
- WXML/WXSS/JavaScript

## 部署说明

### 后端部署
1. 部署到云服务器或云函数
2. 配置环境变量
3. 启动服务

### 小程序部署
1. 在微信公众平台提交审核
2. 发布正式版本

## 注意事项

1. 后端服务需要配置正确的API地址和请求头
2. 小程序需要配置合法域名
3. 生产环境需要配置HTTPS
4. 建议添加错误监控和日志记录