#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}   Nginx 配置诊断和修复脚本${NC}"
echo -e "${YELLOW}========================================${NC}\n"

PROJECT_DIR="/home/fxHook.io"

# 1. 检查文件是否存在
echo -e "${YELLOW}[1] 检查文件结构...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓ 项目目录存在${NC}"
    ls -la "$PROJECT_DIR" | head -20
else
    echo -e "${RED}✗ 项目目录不存在${NC}"
    exit 1
fi

# 2. 检查文件权限
echo -e "\n${YELLOW}[2] 检查文件权限...${NC}"
ls -la "$PROJECT_DIR" | grep -E "pages|docs|scripts|styles|index.html"

# 3. 检查 Nginx 配置
echo -e "\n${YELLOW}[3] 检查 Nginx 配置...${NC}"
if [ -f "/etc/nginx/sites-available/fxhook.io" ]; then
    echo -e "${GREEN}✓ Nginx 配置文件存在${NC}"
    cat /etc/nginx/sites-available/fxhook.io
else
    echo -e "${RED}✗ Nginx 配置文件不存在${NC}"
fi

# 4. 测试文件访问
echo -e "\n${YELLOW}[4] 测试文件访问权限...${NC}"
sudo -u www-data test -r "$PROJECT_DIR/index.html" && echo -e "${GREEN}✓ index.html 可读${NC}" || echo -e "${RED}✗ index.html 不可读${NC}"
sudo -u www-data test -r "$PROJECT_DIR/pages/products.html" && echo -e "${GREEN}✓ pages/products.html 可读${NC}" || echo -e "${RED}✗ pages/products.html 不可读${NC}"

# 5. 修复权限
echo -e "\n${YELLOW}[5] 修复文件权限...${NC}"
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
# 确保所有 HTML 文件可读
find "$PROJECT_DIR" -name "*.html" -exec chmod 644 {} \;
echo -e "${GREEN}✓ 权限已修复${NC}"

# 6. 检查 Nginx 错误日志
echo -e "\n${YELLOW}[6] 最近的 Nginx 错误日志...${NC}"
if [ -f "/var/log/nginx/fxhook.error.log" ]; then
    tail -20 /var/log/nginx/fxhook.error.log
else
    echo -e "${YELLOW}暂无错误日志${NC}"
fi

# 7. 重新加载 Nginx
echo -e "\n${YELLOW}[7] 重新加载 Nginx...${NC}"
nginx -t && nginx -s reload && echo -e "${GREEN}✓ Nginx 已重新加载${NC}" || echo -e "${RED}✗ Nginx 重载失败${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   诊断完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}测试访问：${NC}"
echo -e "  主页: curl -I http://127.0.0.1/"
echo -e "  产品页: curl -I http://127.0.0.1/pages/products.html"
echo -e "  博客: curl -I http://127.0.0.1/blog-system/"
