/// <reference types="vite/client" />
import { useBlogStore } from '@stores/blog'
import type { Post } from '@composables/useMarkdown'
import MarkdownIt from 'markdown-it'
import hljs from 'markdown-it-highlightjs'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
}).use(hljs)

interface ApiDoc {
  id?: number
  filename: string
  title: string
  content: string
  category?: string
  tags: string[]
  created_at?: string
  updated_at?: string
  published?: boolean
}

interface PostAttributes {
  title?: string
  date?: string
  tags?: string | string[]
  cover?: string
  description?: string
}

interface RawPostContent {
  attributes: PostAttributes
  html: string
}

type GlobModule = { default: RawPostContent }
type GlobLoader = () => Promise<GlobModule>

/**
 * 共享的文章加载逻辑，支持从 API 动态加载和静态文件加载
 */
export function usePosts() {
  const blogStore = useBlogStore()

  const loadPostsFromAPI = async (): Promise<void> => {
    try {
      blogStore.loading = true
      blogStore.error = null
      
      // 从 API 获取已发布的文档
      const response = await fetch('/api/docs?published=true')
      if (!response.ok) {
        throw new Error('Failed to fetch posts from API')
      }
      
      const docs: ApiDoc[] = await response.json()
      
      // 将 API 数据转换为 Post 格式
      const loadedPosts: Post[] = docs.map(doc => ({
        metadata: {
          title: doc.title,
          date: doc.updated_at || doc.created_at || new Date().toISOString(),
          tags: doc.tags || [],
          cover: '',
          description: doc.content.substring(0, 150) + '...',
          slug: doc.filename.replace('.md', '')
        },
        content: doc.content,
        html: md.render(doc.content),
        toc: ''
      }))
      
      blogStore.setPosts(loadedPosts)
    } catch (error) {
      console.warn('Failed to load posts from API, falling back to static files:', error)
      // API 加载失败时回退到静态文件
      await loadPostsFromStatic()
    } finally {
      blogStore.loading = false
    }
  }

  const loadPostsFromStatic = async (): Promise<void> => {
    try {
      blogStore.loading = true
      blogStore.error = null
      
      // 动态导入所有 markdown 文件
      const postModules = import.meta.glob<GlobModule>('/content/posts/*.md') as Record<string, GlobLoader>
      
      const loadedPosts = await Promise.all(
        Object.entries(postModules).map(async ([path, loader]: [string, GlobLoader]) => {
          try {
            const module = await loader()
            const slug = path.split('/').pop()?.replace('.md', '') || ''
            const content = module.default
            
            // 确保 tags 是数组
            const tags = Array.isArray(content.attributes?.tags) 
              ? content.attributes.tags 
              : (content.attributes?.tags ? [content.attributes.tags] : [])
            
            return {
              metadata: {
                title: content.attributes?.title || 'Untitled',
                date: content.attributes?.date || new Date().toISOString(),
                tags,
                cover: content.attributes?.cover || '',
                description: content.attributes?.description || '',
                slug
              },
              content: content.html || '',
              html: content.html || '',
              toc: ''
            } as Post
          } catch (err) {
            console.error(`Failed to load post: ${path}`, err)
            return null
          }
        })
      )
      
      // 过滤掉加载失败的文章
      const validPosts = loadedPosts.filter((p): p is Post => p !== null)
      blogStore.setPosts(validPosts)
    } catch (error) {
      console.error('Failed to load posts:', error)
      blogStore.error = '加载文章失败，请刷新页面重试'
    } finally {
      blogStore.loading = false
    }
  }

  const loadPosts = async (): Promise<void> => {
    // 如果已经加载过，直接返回
    if (blogStore.posts.length > 0) {
      return
    }
    
    // 优先从 API 加载，失败则回退到静态文件
    await loadPostsFromAPI()
  }

  const refreshPosts = async (): Promise<void> => {
    blogStore.posts = []
    await loadPosts()
  }

  return {
    loadPosts,
    refreshPosts,
    loading: blogStore.loading,
    error: blogStore.error
  }
}
