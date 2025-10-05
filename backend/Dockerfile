# 使用官方 Node.js 14.x 的 alpine 镜像（轻量且含 npm）
FROM node:14-alpine

# 设置容器内工作目录（与云托管服务配置的端口一致）
WORKDIR /app

# 优先复制 package.json 以利用 Docker 缓存层加速构建
COPY package*.json ./
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/  # 设置国内镜像源加速
RUN npm install --production  # 仅安装生产依赖

# 复制所有项目文件到容器（注意排除 .dockerignore 中的非必要文件）
COPY . .

# 必须指定启动命令（与您在 package.json 中定义的 'start' 脚本一致）
CMD ["npm", "start"]

# 暴露端口需与云托管服务配置的监听端口一致（默认为 80）
EXPOSE 3000