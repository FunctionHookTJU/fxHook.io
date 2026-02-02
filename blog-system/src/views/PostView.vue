<template>
  <div class="post-view" v-if="post">
    <ReadingProgress />

    <article class="post-article">
      <header class="post-header">
        <h1 class="post-title">{{ post.metadata.title }}</h1>
        <div class="post-meta">
          <span class="post-date">
            <span class="meta-icon">📅</span>
            {{ formatDate(post.metadata.date) }}
          </span>
          <div class="post-tags">
            <span
              v-for="tag in post.metadata.tags"
              :key="tag"
              class="post-tag"
              @click="goToTag(tag)"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
        <p v-if="post.metadata.description" class="post-description">
          {{ post.metadata.description }}
        </p>
      </header>

      <div class="post-content-wrapper">
        <aside class="post-sidebar">
          <TableOfContents :content="post.html" :sticky="true" />
        </aside>

        <main class="post-main">
          <div v-if="post.metadata.cover" class="post-cover">
            <img :src="post.metadata.cover" :alt="post.metadata.title" />
          </div>

          <MarkdownRenderer :content="post.html" />
        </main>
      </div>
    </article>

    <div class="post-navigation">
      <button
        v-if="prevPost"
        @click="goToPost(prevPost.metadata.slug)"
        class="nav-button nav-prev"
      >
        <span class="nav-icon">←</span>
        <div class="nav-content">
          <span class="nav-label">上一篇</span>
          <span class="nav-title">{{ prevPost.metadata.title }}</span>
        </div>
      </button>

      <button @click="goHome" class="nav-button nav-home">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">返回首页</span>
      </button>

      <button
        v-if="nextPost"
        @click="goToPost(nextPost.metadata.slug)"
        class="nav-button nav-next"
      >
        <div class="nav-content">
          <span class="nav-label">下一篇</span>
          <span class="nav-title">{{ nextPost.metadata.title }}</span>
        </div>
        <span class="nav-icon">→</span>
      </button>
    </div>
  </div>

  <div v-else class="post-not-found">
    <h1>文章未找到</h1>
    <p>抱歉，您访问的文章不存在。</p>
    <button @click="goHome" class="back-home-btn">返回首页</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@stores/blog'
import { usePosts } from '@composables/usePosts'
import MarkdownRenderer from '@components/MarkdownRenderer.vue'
import TableOfContents from '@components/TableOfContents.vue'
import ReadingProgress from '@components/ReadingProgress.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { loadPosts } = usePosts()

const post = computed(() => {
  const slug = route.params.slug as string
  return blogStore.getPostBySlug(slug)
})

const posts = computed(() => blogStore.filteredPosts)
const currentIndex = computed(() => 
  posts.value.findIndex(p => p.metadata.slug === post.value?.metadata.slug)
)

const prevPost = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= posts.value.length - 1) return null
  return posts.value[currentIndex.value + 1]
})

const nextPost = computed(() => {
  if (currentIndex.value <= 0) return null
  return posts.value[currentIndex.value - 1]
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToPost = (slug: string) => {
  router.push(`/post/${slug}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToTag = (tag: string) => {
  router.push(`/tag/${tag}`)
}

const goHome = () => {
  router.push('/')
}

// 更新页面标题
watch(post, (newPost) => {
  if (newPost) {
    document.title = `${newPost.metadata.title} - 我的博客`
  }
}, { immediate: true })

onMounted(async () => {
  await loadPosts()
})
</script>

<style scoped>
.post-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.post-article {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.post-header {
  padding: 2.5rem;
  border-bottom: 1px solid var(--border-color);
}

.post-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.post-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1.1rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.post-tag {
  background: var(--tag-bg);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.post-tag:hover {
  background: var(--tag-hover-bg);
  transform: translateY(-1px);
}

.post-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.post-content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.post-sidebar {
  padding: 2rem 0 2rem 2rem;
  border-right: 1px solid var(--border-color);
}

.post-main {
  padding: 2.5rem;
}

.post-cover {
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: auto;
  display: block;
}

.post-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  text-align: left;
}

.nav-button:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-title {
  font-weight: 600;
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-home {
  flex-direction: column;
  text-align: center;
}

.post-not-found {
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
  padding: 2rem;
}

.post-not-found h1 {
  font-size: 2.5rem;
  color: var(--heading-color);
  margin-bottom: 1rem;
}

.post-not-found p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.back-home-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-home-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

@media (max-width: 1023px) {
  .post-content-wrapper {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    display: none;
  }

  .post-main {
    padding: 2rem;
  }
}

@media (max-width: 767px) {
  .post-header {
    padding: 1.5rem;
  }

  .post-title {
    font-size: 1.75rem;
  }

  .post-main {
    padding: 1.5rem;
  }

  .post-navigation {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .nav-content {
    align-items: center;
  }
}

:root {
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --heading-color: #2c3e50;
  --text-color: #1a1a1a;
  --text-secondary: #6c757d;
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  --tag-bg: rgba(52, 152, 219, 0.1);
  --tag-hover-bg: rgba(52, 152, 219, 0.2);
}

[data-theme="dark"] {
  --card-bg: #2d2d2d;
  --border-color: #3a3a3a;
  --heading-color: #ffffff;
  --text-color: #e0e0e0;
  --text-secondary: #a0a0a0;
  --primary-color: #5dade2;
  --primary-hover: #3498db;
  --tag-bg: rgba(93, 173, 226, 0.15);
  --tag-hover-bg: rgba(93, 173, 226, 0.3);
}

[data-theme="sepia"] {
  --card-bg: #faf3e8;
  --border-color: #d4c4a8;
  --heading-color: #3d2e1f;
  --text-color: #5c4b37;
  --text-secondary: #8b7355;
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
  --tag-bg: rgba(139, 115, 85, 0.1);
  --tag-hover-bg: rgba(139, 115, 85, 0.2);
}
</style>
