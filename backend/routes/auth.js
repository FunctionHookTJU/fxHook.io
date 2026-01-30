const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 简单的管理员认证（仅用于演示，生产环境需要数据库存储）
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '密码不能为空'
      });
    }

    // 验证密码（这里使用环境变量中的密码，生产环境应该使用数据库）
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 验证token的中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token无效或已过期'
    });
  }
};

module.exports = { router, verifyToken };
