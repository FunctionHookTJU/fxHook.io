# 使用官方 Node.js 18 Alpine 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY server.js ./
COPY public ./public

# 创建 docs 目录（将会被挂载）
RUN mkdir -p /app/docs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "server.js"]
