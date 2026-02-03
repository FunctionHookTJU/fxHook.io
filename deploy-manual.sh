#!/bin/bash
# 手动部署脚本 - 当服务器无法访问 GitHub 时使用

SERVER="root@124.70.77.173"
REMOTE_PATH="/home/fxHook.io"

echo "📤 上传配置文件到服务器..."

# 上传修改的配置文件
scp docker-compose.yml $SERVER:$REMOTE_PATH/
scp nginx.conf $SERVER:$REMOTE_PATH/
scp .dockerignore $SERVER:$REMOTE_PATH/
scp CLEANUP.md $SERVER:$REMOTE_PATH/

# 上传博客系统的修改
scp blog-system/src/router/index.ts $SERVER:$REMOTE_PATH/blog-system/src/router/
scp blog-system/vite.config.ts $SERVER:$REMOTE_PATH/blog-system/

echo "✅ 文件上传完成"
echo ""
echo "🚀 现在在服务器上重新部署..."

ssh $SERVER "cd $REMOTE_PATH && sudo docker compose down && sudo docker compose build --no-cache && sudo docker compose up -d"

echo "✅ 部署完成！"
echo ""
echo "访问地址："
echo "  主站: http://124.70.77.173/"
echo "  博客: http://124.70.77.173/blog"
