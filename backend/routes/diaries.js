const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const { body, validationResult } = require('express-validator');

// 获取所有日记（分页）
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Diary.countDocuments();
    const diaries = await Diary.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        diaries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取日记失败',
      error: error.message
    });
  }
});

// 获取单条日记
router.get('/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }
    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取日记失败',
      error: error.message
    });
  }
});

// 创建日记
router.post('/',
  [
    body('date').isISO8601().toDate().withMessage('日期格式不正确'),
    body('content').notEmpty().withMessage('内容不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const diary = new Diary({
        date: req.body.date,
        title: req.body.title || '',
        content: req.body.content,
        images: req.body.images || []
      });

      await diary.save();
      res.status(201).json({
        success: true,
        message: '日记创建成功',
        data: diary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建日记失败',
        error: error.message
      });
    }
  }
);

// 更新日记
router.put('/:id',
  [
    body('date').optional().isISO8601().toDate().withMessage('日期格式不正确'),
    body('content').optional().notEmpty().withMessage('内容不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const diary = await Diary.findById(req.params.id);
      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日记不存在'
        });
      }

      if (req.body.date) diary.date = req.body.date;
      if (req.body.title !== undefined) diary.title = req.body.title;
      if (req.body.content) diary.content = req.body.content;
      if (req.body.images) diary.images = req.body.images;

      await diary.save();
      res.json({
        success: true,
        message: '日记更新成功',
        data: diary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新日记失败',
        error: error.message
      });
    }
  }
);

// 删除日记
router.delete('/:id', async (req, res) => {
  try {
    const diary = await Diary.findByIdAndDelete(req.params.id);
    if (!diary) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }
    res.json({
      success: true,
      message: '日记删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除日记失败',
      error: error.message
    });
  }
});

module.exports = router;
