# Docker部署动态文档编辑系统

## 📖 项目简介

这是一个基于 Docker 的在线 Markdown 文档编辑系统，可以让你在浏览器中编辑、保存和管理文档，非常适合部署在 Linux 服务器上。

## ✨ 功能特性

- 🚀 **一键部署**：使用 Docker Compose 快速启动
- 📝 **在线编辑**：直观的 Markdown 编辑器，支持实时预览
- 💾 **自动保存**：编辑内容自动保存到本地
- 🔒 **文件保护**：重要文件（如 README.md、_sidebar.md）受保护
- 🌐 **Nginx 反向代理**：优化性能和资源访问
- 📱 **响应式设计**：支持桌面和移动设备

## 🏗️ 系统架构

```
┌─────────────────┐
│   浏览器客户端    │
└────────┬────────┘
         │
         ↓ (HTTP/HTTPS)
┌─────────────────┐
│  Nginx (Port 80) │  静态网站 + 反向代理
└────────┬────────┘
         │
         ├─→ 静态文件 (/docs, /assets, etc.)
         │
         └─→ /editor/* → docs-editor (Port 3000)
                        │
                        └─→ 文档 CRUD API
```

## 📋 前置要求

在 Linux 服务器上需要安装：

- Docker (>= 20.10)
- Docker Compose (>= 2.0)
- Git

### 安装 Docker（Ubuntu/Debian）

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
sudo docker --version
sudo docker compose version
```

## 🚀 快速开始

### 1. 克隆项目

```bash
cd /opt  # 或你希望存放项目的目录
git clone https://github.com/FunctionHookTJU/fxHook.io.git
cd fxHook.io
```

### 2. 一键启动

```bash
# 启动所有服务
sudo docker compose up -d

# 查看服务状态
sudo docker compose ps

# 查看日志
sudo docker compose logs -f docs-editor
```

### 3. 访问服务

- **主网站**: http://your-server-ip/
- **文档编辑器**: http://your-server-ip/editor/
- **API 接口**: http://your-server-ip/api/docs

## 📁 目录结构

```
fxHook.io/
├── docs/                  # Markdown 文档目录（持久化数据）
├── docs-editor/           # 编辑器服务
│   ├── server.js         # Node.js API 服务器
│   ├── package.json      # 依赖配置
│   ├── Dockerfile        # Docker 镜像构建
│   └── public/           # 前端编辑器页面
│       └── index.html
├── docker-compose.yml     # Docker Compose 配置
├── nginx.conf            # Nginx 配置
└── assets/               # 静态资源
```

## 🛠️ 常用命令

### 服务管理

```bash
# 启动服务
sudo docker compose up -d

# 停止服务
sudo docker compose down

# 重启服务
sudo docker compose restart

# 重新构建并启动
sudo docker compose up -d --build

# 查看运行状态
sudo docker compose ps
```

### 日志查看

```bash
# 查看所有服务日志
sudo docker compose logs

# 查看特定服务日志
sudo docker compose logs docs-editor
sudo docker compose logs nginx

# 实时跟踪日志
sudo docker compose logs -f
```

### 数据备份

```bash
# 备份 docs 目录
tar -czf docs-backup-$(date +%Y%m%d).tar.gz docs/

# 恢复备份
tar -xzf docs-backup-YYYYMMDD.tar.gz
```

## 🔧 配置说明

### 环境变量

在 `docker-compose.yml` 中可以配置：

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

### 端口配置

默认端口映射：
- Nginx: `80` (HTTP), `443` (HTTPS)
- 文档编辑器: `3000`

修改端口（在 `docker-compose.yml` 中）：

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # 将 80 端口改为 8080
```

### HTTPS 配置

1. 获取 SSL 证书（推荐使用 Let's Encrypt）：

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. 修改 `nginx.conf` 添加 HTTPS 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... 其他配置
}
```

3. 在 `docker-compose.yml` 中挂载证书：

```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

## 📡 API 接口说明

### 获取文档列表

```bash
GET /api/docs
```

响应示例：
```json
[
  {
    "name": "README.md",
    "path": "README.md",
    "modified": "2026-02-02T12:00:00.000Z"
  }
]
```

### 获取文档内容

```bash
GET /api/docs/:filename
```

### 创建/更新文档

```bash
POST /api/docs/:filename
Content-Type: application/json

{
  "content": "# 标题\n\n内容..."
}
```

### 删除文档

```bash
DELETE /api/docs/:filename
```

## 🔐 安全建议

1. **添加访问控制**：配置 Nginx 基本认证

```nginx
location /editor/ {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ... 其他配置
}
```

生成密码文件：
```bash
sudo apt install apache2-utils
sudo htpasswd -c /path/to/.htpasswd username
```

2. **使用 HTTPS**：生产环境务必启用 SSL/TLS

3. **防火墙配置**：

```bash
# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

4. **限制文件上传大小**：在 `nginx.conf` 中添加：

```nginx
client_max_body_size 10M;
```

## 🐛 故障排除

### 容器无法启动

```bash
# 查看详细日志
sudo docker compose logs

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000
```

### 文档保存失败

```bash
# 检查 docs 目录权限
ls -la docs/

# 修复权限
sudo chown -R $USER:$USER docs/
```

### Nginx 502 错误

```bash
# 检查 docs-editor 服务状态
sudo docker compose ps docs-editor

# 重启服务
sudo docker compose restart docs-editor
```

## 📊 性能优化

1. **启用 Gzip 压缩**：已在 `nginx.conf` 中配置

2. **静态资源缓存**：已配置 1 年缓存

3. **调整 worker 连接数**：根据服务器配置修改 `nginx.conf`

```nginx
events {
    worker_connections 2048;  # 增加连接数
}
```

## 🔄 更新部署

```bash
# 拉取最新代码
git pull origin master

# 重新构建并启动
sudo docker compose up -d --build

# 清理旧镜像
sudo docker image prune -f
```

## 📞 技术支持

- GitHub Issues: [https://github.com/FunctionHookTJU/fxHook.io/issues](https://github.com/FunctionHookTJU/fxHook.io/issues)
- Email: 1225230685@qq.com

## 📄 许可证

MIT License

---

**注意**：首次部署后，建议立即修改默认配置并设置访问控制！
