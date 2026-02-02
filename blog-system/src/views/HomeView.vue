<template>
  <div class="home-view">
    <header class="home-header">
      <h1 class="home-title">{{ config.title }}</h1>
      <p class="home-subtitle">{{ config.subtitle }}</p>
    </header>

    <div class="home-controls">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="search-input"
        />
      </div>
      <div class="tag-filter">
        <select v-model="selectedTag" class="tag-select">
          <option value="">全部标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">
            #{{ tag }}
          </option>
        </select>
      </div>
    </div>

    <div class="articles-grid">
      <template v-if="loading">
        <div class="loading-state">
          <p>加载中...</p>
        </div>
      </template>
      <template v-else-if="error">
        <div class="error-state">
          <p>{{ error }}</p>
          <button @click="loadPosts" class="retry-btn">重试</button>
        </div>
      </template>
      <template v-else>
        <ArticleCard
          v-for="post in filteredPosts"
          :key="post.metadata.slug"
          :post="post"
        />
      </template>
    </div>

    <div v-if="filteredPosts.length === 0" class="no-results">
      <p>没有找到匹配的文章</p>
      <button @click="clearFilters" class="clear-filters-btn">清除筛选</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@stores/blog'
import { usePosts } from '@composables/usePosts'
import ArticleCard from '@components/ArticleCard.vue'

const blogStore = useBlogStore()
const { loadPosts } = usePosts()

const searchQuery = computed({
  get: () => blogStore.searchQuery,
  set: (value) => blogStore.setSearchQuery(value)
})

const selectedTag = computed({
  get: () => blogStore.selectedTag,
  set: (value) => blogStore.setSelectedTag(value || null)
})

const filteredPosts = computed(() => blogStore.filteredPosts)
const allTags = computed(() => blogStore.allTags)
const loading = computed(() => blogStore.loading)
const error = computed(() => blogStore.error)

const config = ref({
  title: '我的博客',
  subtitle: '分享技术与思考'
})

const clearFilters = () => {
  blogStore.clearFilters()
}

onMounted(async () => {
  await loadPosts()
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
}

.home-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
}

.home-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.tag-filter {
  min-width: 150px;
}

.tag-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.articles-grid {
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

.clear-filters-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.loading-state,
.error-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-state p {
  font-size: 1.25rem;
}

.error-state p {
  font-size: 1.25rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.retry-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

@media (max-width: 767px) {
  .home-title {
    font-size: 2rem;
  }

  .home-subtitle {
    font-size: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .home-controls {
    flex-direction: column;
  }
}

:root {
  --heading-color: #2c3e50;
  --text-secondary: #6c757d;
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  --border-color: #e0e0e0;
  --input-bg: #ffffff;
  --text-color: #1a1a1a;
}

[data-theme="dark"] {
  --heading-color: #ffffff;
  --text-secondary: #a0a0a0;
  --primary-color: #5dade2;
  --primary-hover: #3498db;
  --border-color: #3a3a3a;
  --input-bg: #2d2d2d;
  --text-color: #e0e0e0;
}

[data-theme="sepia"] {
  --heading-color: #3d2e1f;
  --text-secondary: #8b7355;
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
  --border-color: #d4c4a8;
  --input-bg: #faf3e8;
  --text-color: #5c4b37;
}
</style>
