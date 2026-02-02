#!/bin/bash

# Docker 快速部署脚本
# 用法: bash quick-deploy.sh

set -e

echo "🚀 fxHook.io Docker 快速部署"
echo "=============================="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ 未检测到 Docker Compose，请先安装"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 显示当前配置
echo "📋 当前配置:"
echo "  - 主网站端口: 80"
echo "  - 后端服务: docs-editor (内部端口 3000)"
echo "  - 数据持久化: Docker volume"
echo ""

# 询问是否继续
read -p "是否开始部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 0
fi

echo ""
echo "🔨 开始构建和启动容器..."
echo ""

# 构建并启动
docker compose up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查容器状态
echo ""
echo "📊 容器状态:"
docker compose ps

echo ""
echo "✅ 部署完成!"
echo ""
echo "📱 访问地址:"
echo "  - 主网站: http://localhost/"
echo "  - 博客系统: http://localhost/blog-system/"
echo "  - 文档中心: http://localhost/docs/"
echo "  - 在线编辑器: http://localhost/editor/"
echo ""
echo "📝 常用命令:"
echo "  - 查看日志: docker compose logs -f"
echo "  - 停止服务: docker compose stop"
echo "  - 重启服务: docker compose restart"
echo "  - 删除容器: docker compose down"
echo ""
echo "📖 详细文档: 查看 DOCKER_DEPLOYMENT.md"
echo ""
