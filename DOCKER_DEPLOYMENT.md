# Docker 部署指南

本项目支持使用 Docker Compose 一键部署整个网站。

## 架构说明

项目包含三个 Docker 容器：

1. **nginx** - 前端静态资源服务器（端口 80）
2. **backend** - Node.js API 服务器（端口 3000）
3. **mongodb** - MongoDB 数据库（端口 27017）

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 一键部署

```bash
# 1. 克隆或进入项目目录
cd fxHook.io

# 2. （可选）复制并配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET 等配置

# 3. 构建并启动所有服务
docker compose up -d --build
```

### 访问应用

- **网站前端**: http://localhost
- **后端 API**: http://localhost/api
- **直接访问后端**: http://localhost:3000/api
- **MongoDB**: localhost:27017

## 常用命令

### 查看运行状态

```bash
docker compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f nginx
docker compose logs -f mongodb
```

### 停止服务

```bash
docker compose stop
```

### 停止并删除容器

```bash
docker compose down
```

### 停止并删除容器和数据卷

```bash
docker compose down -v
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart backend
```

### 重新构建并启动

```bash
docker compose up -d --build
```

## 环境变量配置

编辑项目根目录的 `.env` 文件：

```env
# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 允许的跨域源
ALLOWED_ORIGINS=http://localhost,http://your-domain.com
```

## 数据持久化

MongoDB 数据存储在 Docker 卷 `fxhook_mongodb_data` 中，容器删除后数据不会丢失。

查看数据卷：
```bash
docker volume ls
```

备份数据：
```bash
docker compose exec mongodb mongodump --out /data/backup
```

## 生产环境部署建议

### 1. 修改配置

- 修改 `.env` 中的 `JWT_SECRET` 为强密码
- 在 `docker-compose.yml` 中配置 MongoDB 认证
- 配置 Nginx SSL 证书（HTTPS）

### 2. 安全加固

```yaml
# docker-compose.yml 中添加 MongoDB 认证
mongodb:
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: your-secure-password
```

```yaml
# backend 服务相应修改连接字符串
backend:
  environment:
    MONGODB_URI: mongodb://admin:your-secure-password@mongodb:27017/fxhook_diary?authSource=admin
```

### 3. 配置域名和 HTTPS

修改 `nginx.conf`：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... 其他配置
}
```

在 `docker-compose.yml` 的 nginx 服务中添加证书挂载：

```yaml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

### 4. 使用 Docker Swarm 或 Kubernetes

对于大规模部署，考虑使用容器编排工具。

## 故障排查

### 容器无法启动

```bash
# 查看容器状态
docker compose ps

# 查看错误日志
docker compose logs backend
```

### 后端无法连接数据库

检查 MongoDB 容器是否已启动并健康：

```bash
docker compose ps mongodb
docker compose logs mongodb
```

### 前端无法访问 API

检查 Nginx 反向代理配置：

```bash
docker compose logs nginx
```

### 端口冲突

如果端口已被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 将主机端口改为 8080
```

## 更新部署

当代码更新后：

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build
```

## 监控和维护

### 查看资源使用情况

```bash
docker stats
```

### 清理未使用的资源

```bash
# 清理未使用的容器、网络、镜像
docker system prune -a
```

### 定期备份数据库

建议设置定时任务备份 MongoDB：

```bash
# 备份脚本示例
docker compose exec -T mongodb mongodump --archive | gzip > backup-$(date +%Y%m%d).gz
```

## 开发模式

如果需要开发调试，可以使用卷挂载实现热重载：

```yaml
backend:
  volumes:
    - ./backend:/app
    - /app/node_modules
  command: npm run dev
```

## 技术支持

如有问题，请查看：
- [后端 API 文档](./backend/API.md)
- [部署文档](./backend/DEPLOYMENT.md)
- [宝塔面板部署](./backend/DEPLOYMENT_BAOTA.md)
