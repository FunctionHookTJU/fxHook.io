<template>
  <div class="stats-view">
    <div class="page-header">
      <h1>📊 数据统计</h1>
      <p class="page-desc">查看文档系统的整体数据</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total_docs }}</div>
          <div class="stat-label">总文档数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.published_docs }}</div>
          <div class="stat-label">已发布</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.draft_docs }}</div>
          <div class="stat-label">草稿</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total_categories }}</div>
          <div class="stat-label">分类数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👁</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total_views }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="card mt-4" v-if="categories.length">
      <div class="card-header">
        <h3>📁 分类分布</h3>
      </div>
      <div class="card-body">
        <div class="category-stats">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-stat-item"
          >
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-bar-wrapper">
              <div 
                class="category-bar" 
                :style="{ width: getBarWidth(cat.doc_count) + '%' }"
              ></div>
            </div>
            <div class="category-count">{{ cat.doc_count || 0 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近文档 -->
    <div class="card mt-4" v-if="docs.length">
      <div class="card-header">
        <h3>🕒 最近更新</h3>
      </div>
      <div class="card-body">
        <div class="recent-docs">
          <div 
            v-for="doc in recentDocs" 
            :key="doc.id" 
            class="recent-doc-item"
            @click="openDoc(doc.filename)"
          >
            <span class="doc-title">{{ doc.title }}</span>
            <span class="doc-category">{{ doc.category }}</span>
            <span class="doc-time">{{ formatDate(doc.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocsStore } from '../stores/docs'

const router = useRouter()
const docsStore = useDocsStore()

const { stats, categories, docs } = storeToRefs(docsStore)

const recentDocs = computed(() => {
  return [...docs.value]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 10)
})

const maxDocCount = computed(() => {
  return Math.max(...categories.value.map(c => c.doc_count || 0), 1)
})

onMounted(() => {
  docsStore.fetchStats()
  docsStore.fetchCategories()
  docsStore.fetchDocs()
})

function getBarWidth(count) {
  return ((count || 0) / maxDocCount.value) * 100
}

function openDoc(filename) {
  router.push(`/editor/${encodeURIComponent(filename)}`)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.stats-view {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .page-desc {
    color: var(--text-muted);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  
  .stat-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    border-radius: var(--radius);
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .category-name {
    width: 100px;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .category-bar-wrapper {
    flex: 1;
    height: 8px;
    background: var(--bg-color);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .category-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 4px;
    transition: width 0.5s ease;
  }
  
  .category-count {
    width: 40px;
    text-align: right;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-muted);
  }
}

.recent-docs {
  display: flex;
  flex-direction: column;
}

.recent-doc-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: var(--bg-color);
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .doc-title {
    flex: 1;
    font-weight: 500;
  }
  
  .doc-category {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    background: rgba(102, 126, 234, 0.1);
    color: var(--primary-color);
    border-radius: 9999px;
    margin-right: 1rem;
  }
  
  .doc-time {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}
</style>
