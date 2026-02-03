# 清理说明

## 已删除的功能

### docs-editor 文档编辑器系统
- **删除原因**: 功能与 blog-system 重复，界面较为简单
- **删除内容**:
  - Docker Compose 中的 docs-editor 服务
  - Nginx 中的 /editor 和 /api 代理配置
  - docs-db 数据卷

## 保留的功能

### blog-system 博客系统
- **访问路径**: `/blog`
- **功能**: 
  - 现代化 Vue 3 + TypeScript 界面
  - Markdown 文件作为内容源
  - 三种主题切换
  - 阅读进度条
  - 标签系统
  - 文章搜索

## 删除 docs-editor 目录

```bash
# 可以手动删除整个 docs-editor 目录
rm -rf docs-editor/
```

## 部署说明

部署后访问：
- 主站: `http://your-domain/`
- 博客: `http://your-domain/blog`
