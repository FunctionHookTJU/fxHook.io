# 服务器部署指南

本文档说明如何在 Ubuntu 22.04 服务器上部署 fxHook.io 项目。

## 快速部署

### 1. 上传项目到服务器

```bash
# 方式1: 使用 Git（推荐）
cd /home
git clone https://github.com/FunctionHookTJU/fxHook.io.git

# 方式2: 使用 rsync 从本地上传
rsync -avz --progress ./ root@your-server-ip:/home/fxHook.io/
```

### 2. 运行部署脚本

```bash
cd /home/fxHook.io
chmod +x deploy.sh
sudo bash deploy.sh
```

脚本会自动完成以下操作：
- ✅ 安装 Nginx 和 Node.js
- ✅ 构建博客系统
- ✅ 配置 Nginx
- ✅ 设置文件权限
- ✅ 启动服务

### 3. 配置域名（可选）

编辑部署脚本中的域名：

```bash
nano deploy.sh
# 修改这一行：
DOMAIN="your-domain.com"  # 改为你的实际域名
```

或者直接编辑 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/fxhook.io
# 修改 server_name 行
```

## 手动部署步骤

如果不想使用自动脚本，也可以手动部署：

### 1. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. 构建项目

```bash
cd /home/fxHook.io/blog-system
npm install
npm run build
```

### 3. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/fxhook.io`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /home/fxHook.io;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location /blog-system/ {
        alias /home/fxHook.io/blog-system/dist/;
        try_files $uri $uri/ /blog-system/index.html;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/fxhook.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 设置权限

```bash
sudo chown -R www-data:www-data /home/fxHook.io
sudo chmod -R 755 /home/fxHook.io
```

## 更新部署

当代码有更新时：

```bash
cd /home/fxHook.io

# 拉取最新代码
git pull origin vue

# 重新运行部署脚本
sudo bash deploy.sh
```

## 配置 HTTPS（推荐）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your-domain.com

# 自动续期（Certbot 会自动添加到 cron）
sudo certbot renew --dry-run
```

## 常用命令

```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 重启 Nginx
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo nginx -s reload

# 查看访问日志
sudo tail -f /var/log/nginx/fxhook.access.log

# 查看错误日志
sudo tail -f /var/log/nginx/fxhook.error.log

# 测试 Nginx 配置
sudo nginx -t
```

## 故障排查

### 1. 博客系统 404 错误

检查 dist 目录是否存在：
```bash
ls -la /home/fxHook.io/blog-system/dist
```

如果不存在，重新构建：
```bash
cd /home/fxHook.io/blog-system
npm run build
```

### 2. 权限错误

```bash
sudo chown -R www-data:www-data /home/fxHook.io
sudo chmod -R 755 /home/fxHook.io
```

### 3. Nginx 无法启动

```bash
# 查看详细错误
sudo systemctl status nginx
sudo journalctl -xe -u nginx

# 测试配置
sudo nginx -t
```

## 性能优化

### 启用 Gzip 压缩

已在部署脚本中自动配置。

### 配置浏览器缓存

静态资源已设置 1 年缓存时间。

### 使用 CDN

项目已使用 jsDelivr CDN，可以进一步配置 Cloudflare 等服务。

## 备份建议

定期备份重要文件：

```bash
# 创建备份脚本
cat > /home/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/fxhook_$DATE.tar.gz /home/fxHook.io
# 只保留最近 7 天的备份
find $BACKUP_DIR -name "fxhook_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /home/backup.sh") | crontab -
```

## 监控

### 设置基本监控

```bash
# 安装 htop 查看系统资源
sudo apt install htop -y

# 查看 Nginx 连接数
sudo apt install apache2-utils -y
ab -n 100 -c 10 http://your-domain.com/
```

## 联系支持

如有问题，请联系：
- Email: 1225230685@qq.com
- GitHub Issues: https://github.com/FunctionHookTJU/fxHook.io/issues
