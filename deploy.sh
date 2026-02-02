#!/bin/bash

# fxHook.io Docker 一键部署脚本
# 适用于 Ubuntu/Debian Linux 系统

set -e

echo "======================================"
echo "  fxHook.io Docker 一键部署脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 某些操作可能需要 sudo 权限${NC}"
fi

# 检查 Docker 是否已安装
echo "检查 Docker 安装状态..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker 未安装！${NC}"
    read -p "是否现在安装 Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "安装 Docker..."
        sudo apt update
        sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        echo -e "${GREEN}Docker 安装完成！${NC}"
    else
        echo -e "${RED}部署需要 Docker，退出安装${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Docker 已安装 ✓${NC}"
    docker --version
fi

# 检查 Docker Compose
echo "检查 Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose 未安装！${NC}"
    exit 1
else
    echo -e "${GREEN}Docker Compose 已安装 ✓${NC}"
    docker compose version
fi

# 进入项目目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "准备构建和启动服务..."

# 停止现有容器（如果存在）
if [ "$(docker ps -q -f name=fxhook)" ]; then
    echo "停止现有容器..."
    sudo docker compose down
fi

# 构建并启动服务
echo "构建 Docker 镜像..."
sudo docker compose build

echo "启动服务..."
sudo docker compose up -d

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "检查服务状态..."
sudo docker compose ps

# 获取服务器 IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}======================================"
echo "  部署完成！"
echo "======================================${NC}"
echo ""
echo "访问地址："
echo -e "  主网站:        ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "  文档编辑器:    ${GREEN}http://${SERVER_IP}/editor/${NC}"
echo -e "  API 接口:      ${GREEN}http://${SERVER_IP}/api/docs${NC}"
echo ""
echo "常用命令："
echo "  查看日志:      sudo docker compose logs -f"
echo "  停止服务:      sudo docker compose down"
echo "  重启服务:      sudo docker compose restart"
echo ""
echo -e "${YELLOW}提示: 生产环境请配置 HTTPS 和访问控制！${NC}"
echo ""
