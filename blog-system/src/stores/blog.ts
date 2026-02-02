import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Post } from '@composables/useMarkdown'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedTag = ref<string | null>(null)

  const filteredPosts = computed(() => {
    let result = posts.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(post => 
        post.metadata.title.toLowerCase().includes(query) ||
        post.metadata.description?.toLowerCase().includes(query) ||
        post.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedTag.value) {
      result = result.filter(post => 
        post.metadata.tags.includes(selectedTag.value!)
      )
    }

    return result.sort((a, b) => 
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    )
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    posts.value.forEach(post => {
      post.metadata.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const postsByTag = computed(() => {
    const tagMap = new Map<string, Post[]>()
    posts.value.forEach(post => {
      post.metadata.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, [])
        }
        tagMap.get(tag)!.push(post)
      })
    })
    return tagMap
  })

  const setPosts = (newPosts: Post[]) => {
    posts.value = newPosts
  }

  const addPost = (post: Post) => {
    const index = posts.value.findIndex(p => p.metadata.slug === post.metadata.slug)
    if (index >= 0) {
      posts.value[index] = post
    } else {
      posts.value.push(post)
    }
  }

  const getPostBySlug = (slug: string) => {
    return posts.value.find(post => post.metadata.slug === slug)
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSelectedTag = (tag: string | null) => {
    selectedTag.value = tag
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedTag.value = null
  }

  return {
    posts,
    loading,
    error,
    searchQuery,
    selectedTag,
    filteredPosts,
    allTags,
    postsByTag,
    setPosts,
    addPost,
    getPostBySlug,
    setSearchQuery,
    setSelectedTag,
    clearFilters
  }
})
