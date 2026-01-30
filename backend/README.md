# fxHook.io 日记系统

基于 Node.js + Express + MongoDB 的全栈日记系统

## 功能特点

- ✅ 完整的RESTful API
- ✅ 日记增删改查
- ✅ 分页加载
- ✅ 管理员认证（JWT）
- ✅ 响应式前端界面
- ✅ 支持图片
- ✅ 日期管理

## 技术栈

### 后端
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT认证
- Express Validator

### 前端
- 原生JavaScript
- Fetch API
- CSS3

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑.env文件，修改配置
```

### 3. 启动MongoDB

```bash
# Linux/Mac
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. 启动后端服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 访问应用

- 前端页面: `http://localhost:5500/pages/diary.html`
- 管理后台: `http://localhost:5500/pages/diary-admin.html`
- API地址: `http://localhost:3000/api`

## 项目结构

```
fxHook.io/
├── backend/                 # 后端代码
│   ├── models/             # 数据模型
│   │   └── Diary.js        # 日记模型
│   ├── routes/             # 路由
│   │   ├── diaries.js      # 日记路由
│   │   └── auth.js         # 认证路由
│   ├── server.js           # 服务器入口
│   ├── package.json        # 依赖配置
│   ├── .env.example        # 环境变量示例
│   ├── DEPLOYMENT.md       # 部署文档
│   └── API.md              # API文档
├── pages/                  # 前端页面
│   ├── diary.html          # 日记展示页
│   └── diary-admin.html    # 管理后台
├── scripts/                # 前端脚本
│   └── diaryAPI.js         # API交互脚本
└── styles/                 # 样式文件
    └── style.css
```

## API文档

详见 [backend/API.md](./backend/API.md)

## 部署指南

详见 [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)

## 使用说明

### 用户端

访问 `diary.html` 页面即可查看所有日记，支持分页浏览。

### 管理端

1. 访问 `diary-admin.html`
2. 输入管理员密码登录（默认密码在.env中配置）
3. 可以创建、编辑、删除日记

## 开发计划

- [ ] 用户系统（多用户支持）
- [ ] 评论功能
- [ ] 标签分类
- [ ] 搜索功能
- [ ] Markdown支持
- [ ] 图片上传
- [ ] 数据导出

## 许可证

MIT License

## 作者

FunctionHookTJU

---

如有问题请提交Issue或PR
