# Docker 部署说明

快速部署到 Linux 服务器的步骤：

## 一键部署

```bash
# 克隆项目
git clone https://github.com/FunctionHookTJU/fxHook.io.git
cd fxHook.io

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

## 手动部署

```bash
# 启动服务
sudo docker compose up -d

# 查看状态
sudo docker compose ps
```

## 访问服务

- 主网站: http://your-ip/
- 文档编辑器: http://your-ip/editor/

详细文档请查看: [Docker部署指南](docs/docker-deployment.md)
