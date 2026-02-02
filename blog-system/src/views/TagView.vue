<template>
  <div class="tag-view">
    <header class="tag-header">
      <h1 class="tag-title">
        <span class="tag-icon">#</span>
        {{ currentTag }}
      </h1>
      <p class="tag-count">共 {{ filteredPosts.length }} 篇文章</p>
    </header>

    <div class="articles-list">
      <ArticleCard
        v-for="post in filteredPosts"
        :key="post.metadata.slug"
        :post="post"
      />
    </div>

    <div v-if="filteredPosts.length === 0" class="no-results">
      <p>该标签下暂无文章</p>
      <button @click="goHome" class="back-home-btn">返回首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@stores/blog'
import { usePosts } from '@composables/usePosts'
import ArticleCard from '@components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { loadPosts } = usePosts()

const currentTag = computed(() => decodeURIComponent(route.params.tag as string))

const filteredPosts = computed(() => {
  return blogStore.posts.filter(post => 
    post.metadata.tags.includes(currentTag.value)
  ).sort((a, b) => 
    new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  )
})

const goHome = () => {
  router.push('/')
}

// 更新页面标题
watch(currentTag, (tag) => {
  document.title = `#${tag} - 我的博客`
}, { immediate: true })

onMounted(async () => {
  await loadPosts()
})
</script>

<style scoped>
.tag-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tag-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 12px;
  color: white;
}

.tag-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tag-icon {
  font-size: 2rem;
}

.tag-count {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.articles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-results p {
  font-size: 1.25rem;
  margin-bottom: 1rem;
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

@media (max-width: 767px) {
  .tag-title {
    font-size: 1.75rem;
  }

  .tag-header {
    padding: 1.5rem;
  }

  .articles-list {
    grid-template-columns: 1fr;
  }
}

:root {
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  --text-secondary: #6c757d;
}

[data-theme="dark"] {
  --primary-color: #5dade2;
  --primary-hover: #3498db;
}

[data-theme="sepia"] {
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
}
</style>
