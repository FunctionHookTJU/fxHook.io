# fxHook.io 日记系统 - 部署文档

## 系统架构

- **前端**: 静态HTML页面 + JavaScript
- **后端**: Node.js + Express
- **数据库**: MongoDB
- **技术栈**: RESTful API

## 一、环境准备

### 1. 安装Node.js
确保服务器上已安装Node.js (建议v18或更高版本)

```bash
# 检查Node.js版本
node -v
npm -v
```

如未安装，可以访问 https://nodejs.org 下载安装

### 2. 安装MongoDB

#### Ubuntu/Debian:
```bash
# 导入MongoDB公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 创建MongoDB源列表文件
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新包列表
sudo apt-get update

# 安装MongoDB
sudo apt-get install -y mongodb-org

# 启动MongoDB服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 检查状态
sudo systemctl status mongod
```

#### CentOS/RHEL:
```bash
# 创建MongoDB仓库文件
sudo vi /etc/yum.repos.d/mongodb-org-7.0.repo

# 添加以下内容：
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc

# 安装
sudo yum install -y mongodb-org

# 启动
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows:
从 https://www.mongodb.com/try/download/community 下载安装包

## 二、后端部署

### 1. 上传后端代码
将 `backend` 文件夹上传到服务器，例如 `/var/www/fxhook-backend`

```bash
cd /var/www/fxhook-backend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制环境变量示例文件并修改：

```bash
cp .env.example .env
nano .env
```

修改 `.env` 文件内容：

```env
# 服务器端口
PORT=3000

# MongoDB连接字符串
# 本地MongoDB
MONGODB_URI=mongodb://localhost:27017/fxhook_diary
# 或远程MongoDB
# MONGODB_URI=mongodb://username:password@host:port/fxhook_diary

# JWT密钥（必须修改为随机字符串）
JWT_SECRET=your_super_secret_random_string_here_change_this

# 管理员密码（首次登录使用）
ADMIN_PASSWORD=your_secure_password_here

# CORS配置（允许的前端域名，多个用逗号分隔）
ALLOWED_ORIGINS=https://functionhooktju.github.io,https://fxhook.fun
```

### 4. 使用PM2管理进程（推荐）

安装PM2：
```bash
sudo npm install -g pm2
```

启动应用：
```bash
pm2 start server.js --name fxhook-diary
```

设置开机自启：
```bash
pm2 startup
pm2 save
```

常用PM2命令：
```bash
pm2 status              # 查看状态
pm2 logs fxhook-diary   # 查看日志
pm2 restart fxhook-diary # 重启应用
pm2 stop fxhook-diary   # 停止应用
pm2 delete fxhook-diary # 删除应用
```

### 5. 配置Nginx反向代理（可选但推荐）

安装Nginx：
```bash
sudo apt-get install nginx  # Ubuntu/Debian
sudo yum install nginx      # CentOS/RHEL
```

创建Nginx配置文件：
```bash
sudo nano /etc/nginx/sites-available/fxhook-api
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name api.fxhook.cn;  # 修改为你的API域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/fxhook-api /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 6. 配置HTTPS（使用Let's Encrypt）

安装Certbot：
```bash
sudo apt-get install certbot python3-certbot-nginx  # Ubuntu/Debian
```

获取SSL证书：
```bash
sudo certbot --nginx -d api.fxhook.cn
```

按提示操作，Certbot会自动配置Nginx

## 三、前端部署

### 1. 修改API地址

编辑 `scripts/diaryAPI.js`，将API_BASE_URL改为你的后端地址：

```javascript
// const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境
const API_BASE_URL = 'https://api.fxhook.cn/api'; // 生产环境
```

### 2. 部署到GitHub Pages

如果使用GitHub Pages：

```bash
git add .
git commit -m "更新日记系统为动态加载"
git push origin dynamic
```

然后在GitHub仓库设置中启用GitHub Pages，选择dynamic分支

### 3. 部署到自己的服务器

如果部署到自己的服务器：

```bash
# 上传整个项目到服务器
scp -r /path/to/fxHook.io user@server:/var/www/fxhook-frontend
```

配置Nginx：
```nginx
server {
    listen 80;
    server_name fxhook.cn www.fxhook.cn;
    root /var/www/fxhook-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 四、数据迁移

### 迁移现有日记数据

创建一个数据迁移脚本 `backend/migrate.js`：

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Diary = require('./models/Diary');

// 现有的日记数据
const existingDiaries = [
  {
    date: new Date('2026-01-21'),
    content: '今天终于把前几门恶心的课给考完了，大物竟然考的都会，只是概率论出成绩，坠机了。\n明天GTM8+ 11:00明日方舟终末地开服，期待中......'
  },
  {
    date: new Date('2026-01-16'),
    content: '我恨计算机系统基础2。我恨数据结构。来自考试前深夜的怒吼...'
  }
  // ... 添加更多日记
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('数据库连接成功');
    
    // 清空现有数据（可选）
    // await Diary.deleteMany({});
    
    // 插入数据
    await Diary.insertMany(existingDiaries);
    console.log('数据迁移完成！');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('迁移失败:', err);
    process.exit(1);
  });
```

运行迁移：
```bash
node migrate.js
```

## 五、测试

### 1. 测试后端API
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取日记列表
curl http://localhost:3000/api/diaries

# 管理员登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'
```

### 2. 测试前端
访问 `http://your-domain/pages/diary.html` 查看日记页面
访问 `http://your-domain/pages/diary-admin.html` 进入管理后台

## 六、安全建议

1. **修改默认密码**: 部署后立即修改 `.env` 中的 `ADMIN_PASSWORD`
2. **保护.env文件**: 确保 `.env` 文件不被外部访问
3. **使用HTTPS**: 生产环境必须使用HTTPS
4. **防火墙配置**: 只开放必要的端口（80, 443）
5. **定期备份**: 定期备份MongoDB数据库

### 数据库备份
```bash
# 备份
mongodump --db=fxhook_diary --out=/backup/mongodb/

# 恢复
mongorestore --db=fxhook_diary /backup/mongodb/fxhook_diary/
```

## 七、常见问题

### Q1: 无法连接到MongoDB
- 检查MongoDB服务是否运行: `sudo systemctl status mongod`
- 检查防火墙设置
- 验证连接字符串是否正确

### Q2: CORS错误
- 确保 `.env` 中的 `ALLOWED_ORIGINS` 包含你的前端域名
- 检查Nginx配置是否正确

### Q3: API请求失败
- 检查后端服务是否运行: `pm2 status`
- 查看日志: `pm2 logs fxhook-diary`
- 验证API_BASE_URL是否正确

## 八、访问地址

部署完成后：

- **前端页面**: https://your-domain/pages/diary.html
- **管理后台**: https://your-domain/pages/diary-admin.html
- **API文档**: https://api.your-domain/api/health

默认管理员密码在 `.env` 文件中设置

---

**完成！** 🎉 你的日记系统已成功部署！
