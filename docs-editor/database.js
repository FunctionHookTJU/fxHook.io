const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

// 数据库文件路径
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'docs.db');

// 确保数据目录存在
fs.ensureDirSync(DB_DIR);

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用 WAL 模式提高性能
db.pragma('journal_mode = WAL');

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT '未分类',
    tags TEXT DEFAULT '[]',
    is_published INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
  CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
  CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at);
`);

// 插入默认分类
const defaultCategories = ['技术文档', '学习笔记', '项目记录', '未分类'];
const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)');
defaultCategories.forEach((cat, index) => {
  insertCategory.run(cat, index);
});

// ==================== 文档操作 ====================

// 获取所有文档
const getAllDocs = db.prepare(`
  SELECT id, filename, title, category, tags, is_published, view_count, created_at, updated_at
  FROM documents 
  ORDER BY updated_at DESC
`);

// 获取已发布的文档
const getPublishedDocs = db.prepare(`
  SELECT id, filename, title, category, tags, view_count, created_at, updated_at
  FROM documents 
  WHERE is_published = 1
  ORDER BY updated_at DESC
`);

// 根据文件名获取文档
const getDocByFilename = db.prepare(`
  SELECT * FROM documents WHERE filename = ?
`);

// 根据ID获取文档
const getDocById = db.prepare(`
  SELECT * FROM documents WHERE id = ?
`);

// 创建文档
const createDoc = db.prepare(`
  INSERT INTO documents (filename, title, content, category, tags)
  VALUES (?, ?, ?, ?, ?)
`);

// 更新文档
const updateDoc = db.prepare(`
  UPDATE documents 
  SET title = ?, content = ?, category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
  WHERE filename = ?
`);

// 更新文档发布状态
const updatePublishStatus = db.prepare(`
  UPDATE documents SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

// 增加浏览次数
const incrementViewCount = db.prepare(`
  UPDATE documents SET view_count = view_count + 1 WHERE filename = ?
`);

// 删除文档
const deleteDoc = db.prepare(`
  DELETE FROM documents WHERE filename = ?
`);

// 搜索文档
const searchDocs = db.prepare(`
  SELECT id, filename, title, category, tags, created_at, updated_at
  FROM documents 
  WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?) AND is_published = 1
  ORDER BY updated_at DESC
`);

// ==================== 分类操作 ====================

// 获取所有分类
const getAllCategories = db.prepare(`
  SELECT * FROM categories ORDER BY sort_order, name
`);

// 获取分类下的文档数量
const getCategoryDocCount = db.prepare(`
  SELECT category, COUNT(*) as count FROM documents WHERE is_published = 1 GROUP BY category
`);

// 创建分类
const createCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, description, sort_order) VALUES (?, ?, ?)
`);

// 删除分类
const deleteCategory = db.prepare(`
  DELETE FROM categories WHERE name = ? AND name != '未分类'
`);

// ==================== 导出函数 ====================

module.exports = {
  db,
  
  // 文档操作
  getAllDocs: () => getAllDocs.all(),
  getPublishedDocs: () => getPublishedDocs.all(),
  getDocByFilename: (filename) => getDocByFilename.get(filename),
  getDocById: (id) => getDocById.get(id),
  
  createDoc: (filename, title, content, category = '未分类', tags = []) => {
    try {
      return createDoc.run(filename, title, content, category, JSON.stringify(tags));
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('文档已存在');
      }
      throw error;
    }
  },
  
  updateDoc: (filename, title, content, category, tags = []) => {
    return updateDoc.run(title, content, category, JSON.stringify(tags), filename);
  },
  
  updatePublishStatus: (id, isPublished) => {
    return updatePublishStatus.run(isPublished ? 1 : 0, id);
  },
  
  incrementViewCount: (filename) => {
    return incrementViewCount.run(filename);
  },
  
  deleteDoc: (filename) => {
    return deleteDoc.run(filename);
  },
  
  searchDocs: (keyword) => {
    const pattern = `%${keyword}%`;
    return searchDocs.all(pattern, pattern, pattern);
  },
  
  // 分类操作
  getAllCategories: () => getAllCategories.all(),
  getCategoryDocCount: () => {
    const counts = getCategoryDocCount.all();
    const result = {};
    counts.forEach(item => {
      result[item.category] = item.count;
    });
    return result;
  },
  createCategory: (name, description = '', sortOrder = 0) => {
    return createCategory.run(name, description, sortOrder);
  },
  deleteCategory: (name) => {
    return deleteCategory.run(name);
  },
  
  // 关闭数据库
  close: () => db.close()
};
