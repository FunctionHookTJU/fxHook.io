#!/bin/bash

# Docker 部署测试脚本
# 用于验证 Docker 容器部署是否成功

echo "🧪 开始测试 Docker 部署..."
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASSED=0
FAILED=0

# 测试函数
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "测试: $description ... "
    
    if curl -f -s -o /dev/null "$url"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# 1. 检查容器状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  检查容器状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker compose ps | grep -q "fxhook-website.*Up"; then
    echo -e "${GREEN}✓${NC} fxhook-website 容器运行中"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} fxhook-website 容器未运行"
    ((FAILED++))
fi

if docker compose ps | grep -q "fxhook-docs-editor.*Up"; then
    echo -e "${GREEN}✓${NC} fxhook-docs-editor 容器运行中"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} fxhook-docs-editor 容器未运行"
    ((FAILED++))
fi

echo ""

# 2. 测试主网站
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  测试主网站访问"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "http://localhost/" "主页"
test_endpoint "http://localhost/blog-system/" "博客系统"
test_endpoint "http://localhost/docs/" "文档中心"
test_endpoint "http://localhost/pages/study.html" "学习笔记页面"

echo ""

# 3. 测试静态资源
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  测试静态资源"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "http://localhost/styles/style.css" "主样式表"
test_endpoint "http://localhost/scripts/header.js" "Header 脚本"

echo ""

# 4. 测试后端 API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  测试后端 API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "http://localhost/api/health" "健康检查"
test_endpoint "http://localhost/api/sidebar" "侧边栏 API"
test_endpoint "http://localhost/api/docs" "文档列表 API"
test_endpoint "http://localhost/api/categories" "分类 API"

echo ""

# 5. 测试在线编辑器
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  测试在线编辑器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "http://localhost/editor/" "编辑器首页"

echo ""

# 6. 测试侧边栏内容
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  验证侧边栏内容"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SIDEBAR_CONTENT=$(curl -s http://localhost/api/sidebar)

if echo "$SIDEBAR_CONTENT" | grep -q "首页"; then
    echo -e "${GREEN}✓${NC} 侧边栏包含首页链接"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 侧边栏缺少首页链接"
    ((FAILED++))
fi

if echo "$SIDEBAR_CONTENT" | grep -q "技术文档"; then
    echo -e "${GREEN}✓${NC} 侧边栏包含技术文档分类"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 侧边栏未找到技术文档分类（可能还没有文档）"
fi

echo ""

# 7. 检查数据持久化
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  检查数据持久化"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker volume ls | grep -q "docs-db"; then
    echo -e "${GREEN}✓${NC} 数据库卷存在"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 数据库卷不存在"
    ((FAILED++))
fi

if [ -d "./docs" ]; then
    echo -e "${GREEN}✓${NC} docs 目录存在"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} docs 目录不存在"
    ((FAILED++))
fi

echo ""

# 8. 检查健康状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  检查容器健康状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WEBSITE_HEALTH=$(docker inspect fxhook-website --format='{{.State.Health.Status}}' 2>/dev/null)
EDITOR_HEALTH=$(docker inspect fxhook-docs-editor --format='{{.State.Health.Status}}' 2>/dev/null)

if [ "$WEBSITE_HEALTH" == "healthy" ]; then
    echo -e "${GREEN}✓${NC} fxhook-website 健康状态: healthy"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} fxhook-website 健康状态: $WEBSITE_HEALTH"
fi

if [ "$EDITOR_HEALTH" == "healthy" ]; then
    echo -e "${GREEN}✓${NC} fxhook-docs-editor 健康状态: healthy"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} fxhook-docs-editor 健康状态: $EDITOR_HEALTH"
fi

echo ""

# 总结
echo "================================"
echo "📊 测试总结"
echo "================================"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！部署成功！${NC}"
    echo ""
    echo "访问地址:"
    echo "  - 主站: http://localhost/"
    echo "  - 博客: http://localhost/blog-system/"
    echo "  - 文档: http://localhost/docs/"
    echo "  - 编辑器: http://localhost/editor/"
    exit 0
else
    echo -e "${RED}⚠️  部分测试失败，请检查日志${NC}"
    echo ""
    echo "查看日志命令:"
    echo "  docker compose logs -f"
    exit 1
fi
