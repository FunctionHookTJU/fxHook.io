# ==================== 多阶段构建 Dockerfile ====================
# 用于构建主网站和博客系统的静态文件

FROM node:18-alpine AS blog-builder

WORKDIR /app/blog-system

# 复制博客系统依赖文件
COPY blog-system/package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制博客系统源代码
COPY blog-system/ ./

# 构建博客系统
RUN npm run build

# ==================== 生产环境 - Nginx ====================
FROM nginx:alpine

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 创建工作目录
WORKDIR /usr/share/nginx/html

# 复制主站点静态文件
COPY --chown=nginx:nginx index.html ./
COPY --chown=nginx:nginx CNAME ./
COPY --chown=nginx:nginx site.webmanifest ./
COPY --chown=nginx:nginx assets/ ./assets/
COPY --chown=nginx:nginx components/ ./components/
COPY --chown=nginx:nginx docs/ ./docs/
COPY --chown=nginx:nginx pages/ ./pages/
COPY --chown=nginx:nginx scripts/ ./scripts/
COPY --chown=nginx:nginx styles/ ./styles/

# 从构建阶段复制博客系统的构建产物
COPY --from=blog-builder --chown=nginx:nginx /app/blog-system/dist ./blog-system/

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
