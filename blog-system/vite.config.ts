import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import hljs from 'markdown-it-highlightjs'
import anchor from 'markdown-it-anchor'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 添加锚点支持
md.use(anchor, {
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '#',
    placement: 'before'
  }),
  level: [1, 2, 3, 4, 5, 6],
  slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5\-]+/g, '')
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
        
        // 确保 tags 是数组
        const tags = Array.isArray(data.tags) 
          ? data.tags 
          : (data.tags ? [data.tags] : [])
        
        return {
          code: `export default ${JSON.stringify({
            attributes: {
              ...data,
              tags
            },
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
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@views': resolve(__dirname, 'src/views'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@content': resolve(__dirname, 'content')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'markdown-vendor': ['markdown-it', 'markdown-it-anchor', 'markdown-it-table-of-contents', 'markdown-it-highlightjs', 'markdown-it-container', 'highlight.js', 'gray-matter', 'dompurify'],
          'vueuse': ['@vueuse/core']
        }
      }
    }
  }
})
