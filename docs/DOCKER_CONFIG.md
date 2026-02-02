# fxHook.io Docker 容器化部署 - 配置清单

## ✅ 已完成的配置

### 1. 核心配置文件

#### [Dockerfile](../Dockerfile)
- 多阶段构建配置
- 阶段1: 构建 Vue 博客系统
- 阶段2: Nginx 生产环境
- 包含健康检查

#### [docker-compose.yml](../docker-compose.yml)
- 双容器编排配置
  - `fxhook-website`: Nginx 前端服务 (端口 80)
  - `docs-editor`: Node.js 后端服务 (内部端口 3000)
- 网络隔离配置
- 数据持久化配置
- 健康检查配置

#### [nginx.conf](../nginx.conf)
- API 反向代理配置 (`/api/*` → `docs-editor:3000`)
- 编辑器代理配置 (`/editor/*` → `docs-editor:3000`)
- 静态资源缓存优化
- Gzip 压缩配置
- 禁用动态内容缓存 (API、sidebar)

#### [.dockerignore](../.dockerignore)
- 优化构建速度
- 排除不必要的文件
- 保留必要的文档

### 2. 辅助脚本

#### [quick-deploy.sh](../quick-deploy.sh)
- 一键部署脚本
- 环境检查
- 交互式确认
- 状态显示

#### [test-deployment.sh](../test-deployment.sh)
- 部署验证脚本
- 容器状态检查
- 端点测试
- 健康检查
- 详细测试报告

### 3. 文档更新

#### [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md)
- 完整部署指南
- 架构说明
- 故障排查
- 性能优化
- 安全建议
- 备份恢复

#### [README.md](../README.md)
- 添加 Docker 部署说明
- 更新快速开始部分

#### [docs/index.html](index.html)
- 修复 sidebar 加载配置
- 移除对不存在 API 的依赖

#### [docs/_sidebar.md](_sidebar.md)
- 保留教学类文档
- 清理不必要的条目

## 🏗️ 项目架构

```
fxHook.io/
├── Dockerfile                 # 主网站容器构建配置
├── docker-compose.yml         # 容器编排配置
├── nginx.conf                # Nginx 配置
├── .dockerignore             # Docker 忽略文件
├── quick-deploy.sh           # 快速部署脚本
├── test-deployment.sh        # 部署测试脚本
├── DOCKER_DEPLOYMENT.md      # 部署文档
│
├── blog-system/              # Vue 博客系统
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│
├── docs-editor/              # 后端服务
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js            # Express API 服务器
│   ├── database.js          # SQLite 数据库
│   └── public/              # 编辑器前端
│
├── docs/                     # 文档目录
│   ├── index.html           # Docsify 文档系统
│   ├── _sidebar.md          # 侧边栏配置
│   └── *.md                 # Markdown 文档
│
└── [主网站静态文件]
    ├── index.html
    ├── pages/
    ├── scripts/
    ├── styles/
    └── assets/
```

## 🚀 部署流程

### 快速部署

```bash
# 1. 克隆项目
git clone https://github.com/FunctionHookTJU/fxHook.io.git
cd fxHook.io

# 2. 切换分支
git checkout test-SQLite

# 3. 一键部署
bash quick-deploy.sh

# 或直接使用 docker compose
docker compose up -d --build
```

### 验证部署

```bash
# 运行测试脚本
bash test-deployment.sh
```

## 📊 容器说明

### fxhook-website (Nginx)
- **镜像**: nginx:alpine
- **端口**: 80
- **功能**:
  - 托管静态网站文件
  - 托管博客系统构建产物
  - 反向代理 API 请求
  - Gzip 压缩
  - 静态资源缓存

### fxhook-docs-editor (Node.js)
- **镜像**: node:18-alpine
- **端口**: 3000 (内部)
- **功能**:
  - 文档管理 API
  - 动态侧边栏生成 (`/api/sidebar`)
  - 在线 Markdown 编辑器
  - SQLite 数据库
  - 文档全文搜索

## 🔗 API 端点

### 公开端点
- `GET /api/sidebar` - 获取动态侧边栏
- `GET /api/docs` - 获取文档列表
- `GET /api/docs/:filename` - 获取单篇文档
- `GET /api/categories` - 获取分类列表
- `GET /api/health` - 健康检查

### 编辑器端点 (需要访问 /editor/)
- `POST /api/docs/:filename` - 创建/更新文档
- `DELETE /api/docs/:filename` - 删除文档
- `POST /api/sync` - 同步文件系统到数据库

## 💾 数据持久化

1. **文档文件**: `./docs/` → 挂载到两个容器
2. **数据库**: Docker volume `docs-db`
3. **日志**: `./logs/nginx/`

## 🔧 常用命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 删除容器（保留数据）
docker compose down

# 更新部署
git pull && docker compose up -d --build

# 备份数据库
docker exec fxhook-docs-editor tar czf /tmp/db.tar.gz /app/data
docker cp fxhook-docs-editor:/tmp/db.tar.gz ./backup/
```

## 🐛 故障排查

### Sidebar 无法加载
1. 检查后端服务: `docker compose logs docs-editor`
2. 测试 API: `curl http://localhost/api/sidebar`
3. 查看浏览器控制台网络请求

### 端口冲突
修改 `docker-compose.yml` 中的端口映射

### 容器无法启动
查看详细日志: `docker compose logs`

## 📚 相关文档

- [完整部署指南](../DOCKER_DEPLOYMENT.md)
- [项目主 README](../README.md)
- [Docker 官方文档](https://docs.docker.com/)

## ✨ 特性

- ✅ 一键部署
- ✅ 自动健康检查
- ✅ 数据持久化
- ✅ 动态侧边栏
- ✅ 在线编辑器
- ✅ API 反向代理
- ✅ 静态资源优化
- ✅ Gzip 压缩
- ✅ 日志管理

## 🔄 更新日志

- 2026-02-02: 创建 Docker 容器化部署配置
  - 双容器架构
  - Nginx 反向代理
  - 动态侧边栏 API
  - 完整的部署文档和脚本

---

**部署问题**？查看 [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md) 或提交 Issue
