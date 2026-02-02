#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}       fxHook.io 自动部署脚本 (Ubuntu 22.04)${NC}"
echo -e "${BLUE}================================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 权限运行此脚本${NC}"
    echo -e "${YELLOW}   使用命令: sudo bash deploy.sh${NC}"
    exit 1
fi

# 配置变量
PROJECT_DIR="/home/fxHook.io"
NGINX_CONF="/etc/nginx/sites-available/fxhook.io"
DOMAIN="124.70.77.173"  # 修改为你的域名或服务器IP

echo -e "\n${BLUE}📂 项目目录: ${PROJECT_DIR}${NC}"
echo -e "${BLUE}🌐 域名: ${DOMAIN}${NC}\n"

# 步骤 1: 更新系统并安装依赖
echo -e "${YELLOW}[1/6] 检查并安装必要依赖...${NC}"
apt update -qq
if ! command -v nginx &> /dev/null; then
    echo -e "${GREEN}  → 安装 Nginx...${NC}"
    apt install nginx -y
else
    echo -e "${GREEN}  ✓ Nginx 已安装${NC}"
fi

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}  → 安装 Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}  ✓ Node.js 已安装 ($(node -v))${NC}"
fi

# 步骤 2: 进入项目目录
echo -e "\n${YELLOW}[2/6] 进入项目目录...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在: ${PROJECT_DIR}${NC}"
    exit 1
fi
cd "$PROJECT_DIR" || exit 1
echo -e "${GREEN}  ✓ 当前目录: $(pwd)${NC}"

# 步骤 3: 构建博客系统
echo -e "\n${YELLOW}[3/6] 构建博客系统...${NC}"
if [ -d "blog-system" ]; then
    cd blog-system
    
    # 清理旧的构建
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}  → 清理旧的 node_modules...${NC}"
        rm -rf node_modules
    fi
    if [ -d "dist" ]; then
        echo -e "${GREEN}  → 清理旧的 dist...${NC}"
        rm -rf dist
    fi
    
    # 配置 npm 使用官方源
    echo -e "${GREEN}  → 配置 npm 源...${NC}"
    npm config set registry https://registry.npmjs.org/
    npm cache clean --force 2>/dev/null || true
    
    # 安装依赖
    echo -e "${GREEN}  → 安装 npm 依赖（可能需要几分钟）...${NC}"
    if ! npm install; then
        echo -e "${RED}❌ npm install 失败${NC}"
        echo -e "${YELLOW}  → 尝试查看错误日志...${NC}"
        cat ~/.npm/_logs/*-debug-0.log 2>/dev/null | tail -20
        exit 1
    fi
    
    # 检查依赖是否安装成功
    if [ ! -d "node_modules" ]; then
        echo -e "${RED}❌ node_modules 目录不存在${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ npm 依赖安装完成${NC}"
    
    # 构建项目
    echo -e "${GREEN}  → 执行构建...${NC}"
    if ! npm run build; then
        echo -e "${RED}❌ npm run build 失败${NC}"
        exit 1
    fi
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}  ✓ 构建成功！${NC}"
        echo -e "${GREEN}  ✓ dist 目录大小: $(du -sh dist | cut -f1)${NC}"
    else
        echo -e "${RED}❌ 构建失败，dist 目录不存在${NC}"
        exit 1
    fi
    
    cd ..
else
    echo -e "${YELLOW}  ⚠ blog-system 目录不存在，跳过构建${NC}"
fi

# 步骤 4: 配置 Nginx
echo -e "\n${YELLOW}[4/6] 配置 Nginx...${NC}"

# 创建必要的目录
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 确保 nginx.conf 包含 sites-enabled
if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
    echo -e "${GREEN}  → 配置 Nginx 主配置文件...${NC}"
    sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

# 检查并停止占用 80 端口的进程
echo -e "${GREEN}  → 检查 80 端口占用...${NC}"
PORT_PID=$(lsof -ti:80 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
    echo -e "${YELLOW}  → 发现进程占用 80 端口 (PID: $PORT_PID)，正在停止...${NC}"
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 1
fi

cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;
    
    root /home/fxHook.io;
    index index.html;
    
    # 访问日志
    access_log /var/log/nginx/fxhook.access.log;
    error_log /var/log/nginx/fxhook.error.log;
    
    # 主网站根目录
    location / {
        try_files $uri $uri/ $uri/index.html =404;
        autoindex off;
    }
    
    # pages 目录
    location /pages/ {
        try_files $uri $uri/ =404;
    }
    
    # docs 目录
    location /docs/ {
        try_files $uri $uri/ =404;
    }
    
    # scripts 目录
    location /scripts/ {
        try_files $uri $uri/ =404;
    }
    
    # styles 目录
    location /styles/ {
        try_files $uri $uri/ =404;
    }
    
    # assets 目录
    location /assets/ {
        try_files $uri $uri/ =404;
    }
    
    # 博客系统 - SPA 路由支持
    location /blog-system/ {
        alias /home/fxHook.io/blog-system/dist/;
        try_files $uri $uri/ /blog-system/index.html;
        
        # 添加 CORS 头（如果需要）
        add_header Access-Control-Allow-Origin *;
    }
    
    # 静态资源缓存优化
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|otf|webp|mp3|opus)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 安全设置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
EOF

# 替换域名
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$NGINX_CONF"

echo -e "${GREEN}  ✓ Nginx 配置文件已创建: ${NGINX_CONF}${NC}"

# 启用站点
if [ -L "/etc/nginx/sites-enabled/fxhook.io" ]; then
    rm -f /etc/nginx/sites-enabled/fxhook.io
fi
ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/fxhook.io
echo -e "${GREEN}  ✓ 站点已启用${NC}"

# 测试配置
echo -e "${GREEN}  → 测试 Nginx 配置...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}  ✓ Nginx 配置测试通过${NC}"
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    nginx -t
    exit 1
fi

# 步骤 5: 设置文件权限
echo -e "\n${YELLOW}[5/6] 设置文件权限...${NC}"
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
echo -e "${GREEN}  ✓ 权限设置完成${NC}"

# 步骤 6: 重启 Nginx
echo -e "\n${YELLOW}[6/6] 重启 Nginx...${NC}"

# 先停止可能存在的 Nginx 进程
pkill nginx 2>/dev/null || true
sleep 1

# 启动 Nginx
systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}  ✓ Nginx 已成功启动${NC}"
else
    echo -e "${RED}❌ Nginx 启动失败${NC}"
    echo -e "${YELLOW}  → 查看详细错误信息：${NC}"
    systemctl status nginx --no-pager
    journalctl -xeu nginx.service --no-pager | tail -20
    exit 1
fi

# 显示部署信息
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}          🎉 部署成功！${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${BLUE}访问地址:${NC}"
echo -e "  主站: ${GREEN}http://${DOMAIN}${NC}"
echo -e "  博客: ${GREEN}http://${DOMAIN}/blog-system/${NC}"
echo -e "\n${BLUE}有用的命令:${NC}"
echo -e "  查看 Nginx 状态: ${YELLOW}systemctl status nginx${NC}"
echo -e "  查看访问日志:   ${YELLOW}tail -f /var/log/nginx/fxhook.access.log${NC}"
echo -e "  查看错误日志:   ${YELLOW}tail -f /var/log/nginx/fxhook.error.log${NC}"
echo -e "  重新加载配置:   ${YELLOW}nginx -s reload${NC}"
echo -e "${GREEN}================================================${NC}\n"
