/// <reference types="vite/client" />
import { useBlogStore } from '@stores/blog'
import type { Post } from '@composables/useMarkdown'

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
 * 共享的文章加载逻辑，避免在多个视图中重复代码
 */
export function usePosts() {
  const blogStore = useBlogStore()

  const loadPosts = async (): Promise<void> => {
    // 如果已经加载过，直接返回
    if (blogStore.posts.length > 0) {
      return
    }

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
