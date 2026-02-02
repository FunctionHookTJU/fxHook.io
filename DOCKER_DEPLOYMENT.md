# Docker 容器化部署指南

本指南说明如何使用 Docker 和 Docker Compose 一键部署 fxHook.io 项目。

## 🏗️ 架构说明

项目采用双容器架构：

```
┌─────────────────────────────────────────┐
│         fxhook-website (Nginx)          │
│  - 主网站静态文件                         │
│  - 博客系统 (Vue SPA)                    │
│  - API 反向代理                          │
│  端口: 80                                │
└──────────────┬──────────────────────────┘
               │ 代理 /api/* 和 /editor/*
               ↓
┌─────────────────────────────────────────┐
│    docs-editor (Node.js + SQLite)       │
│  - 文档管理 API                          │
│  - 动态侧边栏生成                        │
│  - 在线编辑器                            │
│  端口: 3000 (内部)                       │
└─────────────────────────────────────────┘
```

## 📋 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 安装 Docker (Ubuntu/Debian)

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

### 安装 Docker (macOS/Windows)

下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🚀 快速部署

### 1. 克隆或上传项目

```bash
# 方式1: 使用 Git
git clone https://github.com/FunctionHookTJU/fxHook.io.git
cd fxHook.io

# 方式2: 直接上传项目压缩包到服务器后解压
# scp fxHook.io.zip user@server:/path/
# ssh user@server
# unzip fxHook.io.zip && cd fxHook.io
```

### 2. 切换到正确分支（如果需要）

```bash
# 切换到包含后端代码的分支
git checkout test-SQLite
```

### 3. 一键启动

```bash
# 构建并启动所有服务
docker compose up -d --build
```

这个命令会：
- ✅ 构建博客系统的前端代码
- ✅ 创建 Nginx 容器并部署静态文件
- ✅ 创建 docs-editor 后端容器
- ✅ 配置网络和数据持久化
- ✅ 启动健康检查

### 4. 验证部署

```bash
# 查看容器状态
docker compose ps

# 应该看到两个容器都是 healthy 状态
# NAME                    STATUS
# fxhook-website          Up (healthy)
# fxhook-docs-editor      Up (healthy)

# 查看日志
docker compose logs -f

# 单独查看某个服务的日志
docker compose logs -f fxhook-website
docker compose logs -f docs-editor
```

### 5. 访问网站

- **主网站**: http://your-server-ip/
- **博客系统**: http://your-server-ip/blog-system/
- **文档中心**: http://your-server-ip/docs/
- **在线编辑器**: http://your-server-ip/editor/

## 📝 配置说明

### 环境变量

可以创建 `.env` 文件来自定义配置：

```bash
# .env 文件示例
NODE_ENV=production
PORT=3000
TZ=Asia/Shanghai
```

### 端口配置

默认使用 80 端口，如需修改，编辑 `docker-compose.yml`：

```yaml
services:
  fxhook-website:
    ports:
      - "8080:80"  # 改为 8080 端口
```

### 数据持久化

项目数据保存在以下位置：

1. **文档文件**: `./docs/` (挂载到容器)
2. **数据库**: Docker volume `docs-db` (自动管理)
3. **日志**: `./logs/nginx/` (本地目录)

查看数据卷：
```bash
docker volume ls
docker volume inspect fxhookio_docs-db
```

## 🛠️ 常用操作

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启单个服务
docker compose restart fxhook-website
docker compose restart docs-editor
```

### 停止服务

```bash
# 停止所有服务
docker compose stop

# 停止并删除容器（保留数据）
docker compose down

# 停止并删除所有内容（包括数据卷）
docker compose down -v
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build

# 或者只重启某个服务
docker compose up -d --build --no-deps fxhook-website
```

### 查看资源使用

```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用
docker system df
```

### 进入容器调试

```bash
# 进入 website 容器
docker exec -it fxhook-website sh

# 进入 docs-editor 容器
docker exec -it fxhook-docs-editor sh
```

## 🔧 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker compose logs docs-editor
docker compose logs fxhook-website

# 检查配置文件语法
docker compose config
```

### 2. 端口冲突

```bash
# 查看端口占用
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# 停止占用端口的进程或修改 docker-compose.yml 中的端口
```

### 3. sidebar 无法加载

检查以下几点：

```bash
# 1. 确认后端服务正常
docker compose logs docs-editor

# 2. 测试 API 是否可访问
curl http://localhost/api/sidebar

# 3. 检查 Nginx 代理配置
docker exec -it fxhook-website cat /etc/nginx/nginx.conf

# 4. 查看浏览器控制台网络请求
# 打开浏览器 DevTools -> Network 标签页
```

### 4. 数据库问题

```bash
# 进入容器查看数据库
docker exec -it fxhook-docs-editor sh

# 在容器内
cd /app/data
ls -lh docs.db

# 同步文档到数据库
curl -X POST http://localhost/api/sync
```

### 5. 构建失败

```bash
# 清理构建缓存
docker builder prune -a

# 重新构建
docker compose build --no-cache
docker compose up -d
```

## 📊 性能优化

### 1. Nginx 缓存优化

已在 `nginx.conf` 中配置静态资源缓存：

```nginx
# 静态资源缓存 1 年
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|opus)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 限制容器资源

编辑 `docker-compose.yml` 添加资源限制：

```yaml
services:
  fxhook-website:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 3. 开启 Gzip 压缩

已在 `nginx.conf` 中启用，可调整压缩级别：

```nginx
gzip_comp_level 6;  # 1-9，数字越大压缩率越高但CPU占用越高
```

## 🔒 安全建议

### 1. 使用 HTTPS

推荐使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 2. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 限制 API 访问

考虑添加访问限制：

```nginx
# 在 nginx.conf 中添加
location /editor/ {
    # 只允许特定 IP 访问
    allow 192.168.1.0/24;
    deny all;
    
    proxy_pass http://docs-editor:3000/;
}
```

## 📦 备份与恢复

### 备份

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份文档
cp -r ./docs "$BACKUP_DIR/"

# 备份数据库
docker exec fxhook-docs-editor tar czf /tmp/db-backup.tar.gz /app/data
docker cp fxhook-docs-editor:/tmp/db-backup.tar.gz "$BACKUP_DIR/"

echo "备份完成: $BACKUP_DIR"
```

### 恢复

```bash
# 恢复文档
cp -r /path/to/backup/docs/* ./docs/

# 恢复数据库
docker cp /path/to/backup/db-backup.tar.gz fxhook-docs-editor:/tmp/
docker exec fxhook-docs-editor tar xzf /tmp/db-backup.tar.gz -C /

# 重启服务
docker compose restart docs-editor
```

## 🌐 域名配置

编辑 `nginx.conf` 中的 `server_name`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    # ...
}
```

然后重启：

```bash
docker compose restart fxhook-website
```

## 📚 更多资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 配置指南](https://nginx.org/en/docs/)

## 💡 提示

1. 首次部署可能需要较长时间下载镜像和构建
2. 确保服务器有足够的内存和磁盘空间
3. 定期备份重要数据
4. 查看日志了解运行状态
5. 生产环境建议使用 HTTPS

## 🐛 问题反馈

如遇到问题，请提供以下信息：

```bash
# 系统信息
docker version
docker compose version
uname -a

# 容器状态
docker compose ps
docker compose logs --tail=100

# 资源使用
docker stats --no-stream
```

---

**祝部署顺利！** 🎉
