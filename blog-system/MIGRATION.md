# Vue + Markdown 博客系统 - 移植教程

## 系统概述

这是一个基于 Vue 3 + Markdown 的现代化博客系统，具有以下特点：

- ✅ 完整的 Markdown 渲染支持（代码高亮、表格、引用等）
- ✅ 三种主题切换（浅色、深色、护眼）
- ✅ 响应式设计（适配桌面、平板、手机）
- ✅ 自动生成目录导航
- ✅ 阅读进度条
- ✅ 标签分类和筛选
- ✅ 文章搜索功能
- ✅ 完全可移植到任何网站

## 目录结构

```
blog-system/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── MarkdownRenderer.vue      # Markdown 渲染核心组件
│   │   ├── TableOfContents.vue       # 目录导航组件
│   │   ├── ArticleCard.vue           # 文章卡片
│   │   ├── ThemeToggle.vue           # 主题切换
│   │   └── ReadingProgress.vue       # 阅读进度条
│   ├── composables/         # 组合式函数
│   │   ├── useMarkdown.ts            # Markdown 解析逻辑
│   │   ├── useToc.ts                 # 目录生成逻辑
│   │   ├── useReadingProgress.ts     # 阅读进度追踪
│   │   └── useTheme.ts              # 主题管理
│   ├── views/               # 页面组件
│   │   ├── HomeView.vue              # 首页
│   │   ├── PostView.vue              # 文章详情
│   │   └── TagView.vue               # 标签页
│   ├── stores/              # Pinia 状态管理
│   │   └── blog.ts                   # 博客数据存储
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── content/
│   └── posts/              # Markdown 文章
│       ├── welcome.md
│       ├── vue-best-practices.md
│       └── typescript-guide.md
├── index.html              # HTML 入口
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
├── blog.config.js          # 博客配置
└── README.md               # 本文档
```

## 移植步骤

### 方式一：独立部署（推荐）

#### 1. 安装依赖

```bash
cd blog-system
npm install
```

#### 2. 配置博客

编辑 `blog.config.js` 文件：

```javascript
export default {
  title: '我的博客',
  subtitle: '分享技术与思考',
  description: '基于 Vue 3 和 Markdown 的现代化博客系统',
  author: 'Your Name',
  url: 'https://yourdomain.com',
  
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    email: 'your.email@example.com'
  },

  posts: {
    perPage: 10,
    dateFormat: 'YYYY-MM-DD'
  },

  theme: {
    default: 'light',
    available: ['light', 'dark', 'sepia']
  }
}
```

#### 3. 添加文章

在 `content/posts/` 目录下创建 Markdown 文件，格式如下：

```markdown
---
title: "文章标题"
date: "2025-01-15"
tags: ["Vue", "Markdown"]
description: "文章描述"
cover: "/images/cover.jpg"
---

# 文章内容

使用 Markdown 语法编写内容...
```

#### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看效果。

#### 5. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist/` 目录，可以直接部署到任何静态网站托管服务。

### 方式二：集成到现有网站

#### 1. 复制核心文件

将以下文件/文件夹复制到你的项目中：

```
your-project/
├── src/
│   ├── components/          # 复制所有组件
│   ├── composables/         # 复制所有 composables
│   ├── stores/              # 复制 blog.ts
│   └── router/              # 复制 index.ts（或合并到现有路由）
├── content/
│   └── posts/              # 复制或创建新的文章目录
└── blog.config.js          # 复制配置文件
```

#### 2. 安装依赖

```bash
npm install vue vue-router pinia markdown-it markdown-it-anchor markdown-it-table-of-contents markdown-it-highlightjs markdown-it-container highlight.js gray-matter dompurify @vueuse/core
```

#### 3. 配置路由

在你的路由配置中添加博客路由：

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 你现有的路由...
  
  // 博客路由
  {
    path: '/blog',
    name: 'BlogHome',
    component: () => import('@/components/BlogHome.vue')
  },
  {
    path: '/blog/post/:slug',
    name: 'BlogPost',
    component: () => import('@/components/BlogPost.vue')
  },
  {
    path: '/blog/tag/:tag',
    name: 'BlogTag',
    component: () => import('@/components/BlogTag.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### 4. 配置 Vite

在你的 `vite.config.ts` 中添加 Markdown 处理插件：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import hljs from 'markdown-it-highlightjs'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

md.use(hljs, {
  auto: true,
  code: true
})

function markdownToHtmlPlugin() {
  return {
    name: 'markdown-to-html',
    transform(code: string, id: string) {
      if (id.endsWith('.md')) {
        const { data, content } = matter(code)
        const html = md.render(content)
        
        return {
          code: `export default ${JSON.stringify({
            attributes: data,
            html
          })}`,
          map: null
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), markdownToHtmlPlugin()],
  // 你的其他配置...
})
```

#### 5. 创建博客入口组件

创建 `src/components/BlogHome.vue`：

```vue
<template>
  <div class="blog-home">
    <header class="blog-header">
      <h1>{{ config.title }}</h1>
      <p>{{ config.subtitle }}</p>
    </header>

    <div class="blog-controls">
      <input v-model="searchQuery" placeholder="搜索文章..." class="search-input" />
      <select v-model="selectedTag" class="tag-select">
        <option value="">全部标签</option>
        <option v-for="tag in allTags" :key="tag" :value="tag">#{{ tag }}</option>
      </select>
    </div>

    <div class="articles-grid">
      <ArticleCard
        v-for="post in filteredPosts"
        :key="post.metadata.slug"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
import ArticleCard from '@/components/ArticleCard.vue'
import config from '@/blog.config'

const blogStore = useBlogStore()
const searchQuery = ref('')
const selectedTag = ref('')

const filteredPosts = computed(() => blogStore.filteredPosts)
const allTags = computed(() => blogStore.allTags)

onMounted(async () => {
  await loadPosts()
})

const loadPosts = async () => {
  const postModules = import.meta.glob('/content/posts/*.md')
  const posts = await Promise.all(
    Object.entries(postModules).map(async ([path, module]) => {
      const content = await module()
      const slug = path.split('/').pop()?.replace('.md', '') || ''
      return {
        metadata: { ...content.attributes, slug },
        content: content.html || '',
        html: content.html || '',
        toc: ''
      }
    })
  )
  blogStore.setPosts(posts)
}
</script>

<style scoped>
/* 添加你的样式 */
</style>
```

#### 6. 在导航中添加链接

在你的导航组件中添加博客链接：

```vue
<template>
  <nav>
    <router-link to="/">首页</router-link>
    <router-link to="/blog">博客</router-link>
    <!-- 其他链接 -->
  </nav>
</template>
```

### 方式三：作为子路径部署

如果你想在现有网站的子路径下部署博客（如 `yourdomain.com/blog`）：

#### 1. 修改路由配置

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHistory('/blog/'),  // 添加基础路径
  routes
})
```

#### 2. 修改 Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  base: '/blog/',  // 添加基础路径
  // 其他配置...
})
```

#### 3. 构建和部署

```bash
npm run build
```

将 `dist/` 目录的内容上传到服务器的 `/blog/` 路径。

## 部署选项

### 静态网站托管

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages

1. 在 `vite.config.ts` 中设置 `base: '/your-repo-name/'`
2. 构建项目：`npm run build`
3. 将 `dist/` 目录推送到 `gh-pages` 分支

### 传统服务器

将 `dist/` 目录的内容上传到你的 Web 服务器（Apache、Nginx 等）。

## 自定义配置

### 修改主题颜色

在组件的 `<style>` 部分修改 CSS 变量：

```css
:root {
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  /* 其他颜色变量 */
}
```

### 添加新的 Markdown 插件

编辑 `vite.config.ts` 中的 Markdown 配置：

```typescript
import footnote from 'markdown-it-footnote'
import tasklist from 'markdown-it-task-lists'

md.use(footnote)
md.use(tasklist, { enabled: true })
```

### 自定义组件样式

每个组件都有独立的 `<style scoped>` 部分，你可以根据需要修改样式。

## 常见问题

### Q: 如何添加图片？

A: 将图片放在 `public/images/` 目录，然后在 Markdown 中引用：

```markdown
![图片描述](/images/your-image.jpg)
```

### Q: 如何支持数学公式？

A: 安装并配置 KaTeX：

```bash
npm install katex markdown-it-katex
```

在 `vite.config.ts` 中添加：

```typescript
import katex from 'markdown-it-katex'
md.use(katex)
```

### Q: 如何添加评论系统？

A: 可以集成 Giscus、Twikoo 或 Waline 等评论系统。在 `PostView.vue` 中添加评论组件。

### Q: 如何实现全文搜索？

A: 可以使用 FlexSearch 或集成 Algolia DocSearch。

## 技术支持

如有问题，请提交 Issue 或联系开发者。

## 许可证

MIT License

---

祝您使用愉快！
