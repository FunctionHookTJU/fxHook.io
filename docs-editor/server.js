const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname, '../docs');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 确保文档目录存在
fs.ensureDirSync(DOCS_DIR);

// 获取所有文档列表
app.get('/api/docs', async (req, res) => {
  try {
    const files = await fs.readdir(DOCS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    const docs = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(DOCS_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: file,
          modified: stats.mtime
        };
      })
    );
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: '获取文档列表失败', details: error.message });
  }
});

// 获取单个文档内容
app.get('/api/docs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: '无效的文件名' });
    }
    
    const filePath = path.join(DOCS_DIR, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: '文档不存在' });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ filename, content });
  } catch (error) {
    res.status(500).json({ error: '读取文档失败', details: error.message });
  }
});

// 创建或更新文档
app.post('/api/docs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    
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
    
    const filePath = path.join(DOCS_DIR, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ 
      success: true, 
      message: '文档保存成功',
      filename 
    });
  } catch (error) {
    res.status(500).json({ error: '保存文档失败', details: error.message });
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
    
    const filePath = path.join(DOCS_DIR, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: '文档不存在' });
    }
    
    await fs.remove(filePath);
    res.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除文档失败', details: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`文档编辑服务运行在端口 ${PORT}`);
  console.log(`文档目录: ${DOCS_DIR}`);
});
