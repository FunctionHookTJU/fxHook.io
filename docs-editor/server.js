const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname, '../docs');

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// 确保文档目录存在
fs.ensureDirSync(DOCS_DIR);

// ==================== 文档 API ====================

// 获取所有文档列表
app.get('/api/docs', (req, res) => {
  try {
    const { published } = req.query;
    const docs = published === 'true' ? db.getPublishedDocs() : db.getAllDocs();
    
    // 解析 tags JSON
    const result = docs.map(doc => ({
      ...doc,
      tags: JSON.parse(doc.tags || '[]')
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取文档列表失败', details: error.message });
  }
});

// 搜索文档
app.get('/api/docs/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: '搜索关键词至少需要2个字符' });
    }
    
    const docs = db.searchDocs(q.trim());
    const result = docs.map(doc => ({
      ...doc,
      tags: JSON.parse(doc.tags || '[]')
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '搜索失败', details: error.message });
  }
});

// 获取单个文档
app.get('/api/docs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // 安全检查
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    // 先从数据库获取
    let doc = db.getDocByFilename(filename);
    
    if (doc) {
      // 增加浏览次数
      db.incrementViewCount(filename);
      doc.tags = JSON.parse(doc.tags || '[]');
      return res.json(doc);
    }
    
    // 如果数据库没有，尝试从文件系统读取（兼容旧文档）
    const filePath = path.join(DOCS_DIR, filename);
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const title = extractTitle(content) || filename.replace('.md', '');
      
      // 同步到数据库
      try {
        db.createDoc(filename, title, content, '未分类', []);
      } catch (e) {
        // 忽略重复插入错误
      }
      
      return res.json({ filename, title, content, category: '未分类', tags: [] });
    }
    
    res.status(404).json({ error: '文档不存在' });
  } catch (error) {
    res.status(500).json({ error: '读取文档失败', details: error.message });
  }
});

// 创建或更新文档
app.post('/api/docs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content, title, category, tags } = req.body;
    
    // 安全检查
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    if (!filename.endsWith('.md')) {
      return res.status(400).json({ error: '只支持.md文件' });
    }
    
    if (typeof content !== 'string') {
      return res.status(400).json({ error: '内容必须是字符串' });
    }
    
    // 提取或使用传入的标题
    const docTitle = title || extractTitle(content) || filename.replace('.md', '');
    const docCategory = category || '未分类';
    const docTags = Array.isArray(tags) ? tags : [];
    
    // 写入文件系统
    const filePath = path.join(DOCS_DIR, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    
    // 检查是否已存在
    const existingDoc = db.getDocByFilename(filename);
    
    if (existingDoc) {
      // 更新
      db.updateDoc(filename, docTitle, content, docCategory, docTags);
    } else {
      // 创建
      db.createDoc(filename, docTitle, content, docCategory, docTags);
    }
    
    res.json({ 
      success: true, 
      message: existingDoc ? '文档更新成功' : '文档创建成功',
      filename,
      title: docTitle
    });
  } catch (error) {
    res.status(500).json({ error: '保存文档失败', details: error.message });
  }
});

// 更新文档元数据（不更新内容）
app.patch('/api/docs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    
    if (typeof is_published === 'boolean') {
      db.updatePublishStatus(parseInt(id), is_published);
    }
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新失败', details: error.message });
  }
});

// 删除文档
app.delete('/api/docs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // 安全检查
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    // 保护重要文件
    const protectedFiles = ['README.md', '_sidebar.md'];
    if (protectedFiles.includes(filename)) {
      return res.status(403).json({ error: '该文件受保护，不能删除' });
    }
    
    // 从数据库删除
    db.deleteDoc(filename);
    
    // 从文件系统删除
    const filePath = path.join(DOCS_DIR, filename);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
    
    res.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除文档失败', details: error.message });
  }
});

// ==================== 分类 API ====================

// 获取所有分类
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getAllCategories();
    const docCounts = db.getCategoryDocCount();
    
    const result = categories.map(cat => ({
      ...cat,
      doc_count: docCounts[cat.name] || 0
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败', details: error.message });
  }
});

// 创建分类
app.post('/api/categories', (req, res) => {
  try {
    const { name, description, sort_order } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: '分类名称不能为空' });
    }
    
    db.createCategory(name.trim(), description || '', sort_order || 0);
    res.json({ success: true, message: '分类创建成功' });
  } catch (error) {
    res.status(500).json({ error: '创建分类失败', details: error.message });
  }
});

// 删除分类
app.delete('/api/categories/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    if (name === '未分类') {
      return res.status(403).json({ error: '默认分类不能删除' });
    }
    
    db.deleteCategory(name);
    res.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除分类失败', details: error.message });
  }
});

// ==================== 侧边栏 API ====================

// 动态生成侧边栏 markdown
app.get('/api/sidebar', (req, res) => {
  try {
    const docs = db.getPublishedDocs();
    const categories = db.getAllCategories();
    
    // 按分类组织文档
    const docsByCategory = {};
    docs.forEach(doc => {
      const cat = doc.category || '未分类';
      if (!docsByCategory[cat]) {
        docsByCategory[cat] = [];
      }
      docsByCategory[cat].push(doc);
    });
    
    // 生成 markdown 格式的侧边栏
    let sidebar = '* [📖 首页](/)\n\n';
    
    categories.forEach(cat => {
      const catDocs = docsByCategory[cat.name];
      if (catDocs && catDocs.length > 0) {
        sidebar += `* 📁 ${cat.name}\n`;
        catDocs.forEach(doc => {
          sidebar += `  * [${doc.title}](${doc.filename})\n`;
        });
        sidebar += '\n';
      }
    });
    
    sidebar += '* 🔗 链接\n';
    sidebar += '  * [✏️ 在线编辑器](http://localhost:3001)\n';
    sidebar += '  * [🏠 返回主站](../)\n';
    sidebar += '  * [GitHub](https://github.com/FunctionHookTJU)\n';
    
    res.type('text/markdown').send(sidebar);
  } catch (error) {
    res.status(500).send('* 加载失败');
  }
});

// ==================== 同步 API ====================

// 从文件系统同步文档到数据库
app.post('/api/sync', async (req, res) => {
  try {
    const files = await fs.readdir(DOCS_DIR);
    const mdFiles = files.filter(file => 
      file.endsWith('.md') && 
      !file.startsWith('_') && 
      file !== 'README.md'
    );
    
    let synced = 0;
    let skipped = 0;
    
    for (const filename of mdFiles) {
      const existing = db.getDocByFilename(filename);
      if (!existing) {
        const filePath = path.join(DOCS_DIR, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const title = extractTitle(content) || filename.replace('.md', '');
        
        try {
          db.createDoc(filename, title, content, '未分类', []);
          synced++;
        } catch (e) {
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `同步完成：新增 ${synced} 篇，跳过 ${skipped} 篇`
    });
  } catch (error) {
    res.status(500).json({ error: '同步失败', details: error.message });
  }
});

// ==================== 统计 API ====================

app.get('/api/stats', (req, res) => {
  try {
    const allDocs = db.getAllDocs();
    const publishedDocs = db.getPublishedDocs();
    const categories = db.getAllCategories();
    
    const totalViews = allDocs.reduce((sum, doc) => sum + (doc.view_count || 0), 0);
    
    res.json({
      total_docs: allDocs.length,
      published_docs: publishedDocs.length,
      draft_docs: allDocs.length - publishedDocs.length,
      total_categories: categories.length,
      total_views: totalViews
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败', details: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== 辅助函数 ====================

// 从 markdown 内容提取标题
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

// SPA 路由支持 - 所有非 API 请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务...');
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`文档编辑服务运行在端口 ${PORT}`);
  console.log(`文档目录: ${DOCS_DIR}`);
  console.log(`数据库已连接`);
});
