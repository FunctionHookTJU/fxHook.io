const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updatedAt
diarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Diary', diarySchema);
