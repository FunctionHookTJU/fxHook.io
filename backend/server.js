require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS配置 - 生产环境允许所有来源（通过 Nginx 反向代理访问时更安全）
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5500'];

// 判断是否为允许的来源
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // 允许没有 origin 的请求
  
  // 检查是否在白名单中
  if (allowedOrigins.includes(origin)) return true;
  
  // 允许所有 localhost 来源
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  
  // 允许同一服务器的不同端口（通过 IP 访问）
  const originHost = new URL(origin).hostname;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(originHost)) return true;
  
  // 生产环境：允许所有来源（因为有 Nginx 反向代理保护）
  if (process.env.NODE_ENV === 'production') return true;
  
  return false;
};

app.use(cors({
  origin: function(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    const msg = 'CORS policy: 该域名未被允许访问此资源';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fxhook_diary';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB连接成功'))
.catch(err => {
  console.error('❌ MongoDB连接失败:', err);
  process.exit(1);
});

// 路由
const diariesRouter = require('./routes/diaries');
const { router: authRouter, verifyToken } = require('./routes/auth');

app.use('/api/auth', authRouter);
app.use('/api/diaries', diariesRouter);

// 受保护的路由（需要认证）
// 如果需要保护创建、更新、删除操作，可以这样：
// app.use('/api/diaries', verifyToken, diariesRouter);
// 但为了方便演示，这里暂时不加认证

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 API地址: http://localhost:${PORT}/api`);
});
