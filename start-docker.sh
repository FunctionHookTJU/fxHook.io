#!/bin/bash

echo "🐳 开始验证 Docker 部署..."

# 检查 Docker 是否安装
echo -e "\n1️⃣ 检查 Docker..."
if command -v docker &> /dev/null; then
    docker --version
    echo "✅ Docker 已安装"
else
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否可用
echo -e "\n2️⃣ 检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose --version
    echo "✅ Docker Compose 已安装"
elif docker compose version &> /dev/null; then
    docker compose version
    echo "✅ Docker Compose (V2) 已安装"
else
    echo "❌ Docker Compose 未安装"
    exit 1
fi

# 检查必要文件
echo -e "\n3️⃣ 检查必要文件..."
required_files=(
    "docker-compose.yml"
    "nginx.conf"
    "backend/Dockerfile"
    "backend/server.js"
    "backend/package.json"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file 不存在"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "\n❌ 缺少必要文件，请检查项目完整性"
    exit 1
fi

# 检查环境变量文件
echo -e "\n4️⃣ 检查环境变量..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "  ⚠️  .env 文件不存在，从 .env.example 复制..."
        cp ".env.example" ".env"
        echo "  ✅ 已创建 .env 文件"
        echo "  ⚠️  请编辑 .env 文件，修改生产环境配置（特别是 JWT_SECRET）"
    else
        echo "  ⚠️  .env 文件不存在，将使用默认配置"
    fi
else
    echo "  ✅ .env 文件已存在"
fi

# 询问是否启动
echo -e "\n✨ 验证完成！"
echo "准备执行: docker compose up -d --build"
read -p "是否现在启动？(Y/N): " response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "\n🚀 正在启动服务..."
    docker compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo -e "\n✅ 服务启动成功！"
        echo -e "\n📋 服务状态:"
        docker compose ps
        
        echo -e "\n🌐 访问地址:"
        echo "  前端: http://localhost"
        echo "  后端: http://localhost:3000/api"
        echo "  健康检查: http://localhost:3000/api/health"
        
        echo -e "\n📝 查看日志:"
        echo "  docker compose logs -f"
        
        echo -e "\n⏹️  停止服务:"
        echo "  docker compose down"
    else
        echo -e "\n❌ 服务启动失败，请查看错误信息"
    fi
else
    echo -e "\n👍 稍后可以使用以下命令启动:"
    echo "  docker compose up -d --build"
fi
