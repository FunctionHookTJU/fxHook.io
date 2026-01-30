# Quick Start with Docker

## 一键部署整个项目

```bash
docker compose up -d --build
```

访问 http://localhost 即可！

详细文档请查看 [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## 常用命令

```bash
# 启动
docker compose up -d --build

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止
docker compose stop

# 删除（保留数据）
docker compose down

# 删除（包括数据）
docker compose down -v
```
