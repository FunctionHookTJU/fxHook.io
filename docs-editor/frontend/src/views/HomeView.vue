<template>
  <div class="home-view">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchKeyword" 
          type="text" 
          class="search-input" 
          placeholder="搜索文档标题、内容..."
          @keyup.enter="handleSearch"
        >
        <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">×</button>
      </div>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <router-link to="/editor" class="btn btn-success">
        <span>+ 新建文档</span>
      </router-link>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <button 
        :class="['filter-tab', { active: currentFilter === 'all' }]"
        @click="currentFilter = 'all'"
      >
        全部 ({{ docs.length }})
      </button>
      <button 
        :class="['filter-tab', { active: currentFilter === 'published' }]"
        @click="currentFilter = 'published'"
      >
        已发布 ({{ publishedDocs.length }})
      </button>
      <button 
        :class="['filter-tab', { active: currentFilter === 'draft' }]"
        @click="currentFilter = 'draft'"
      >
        草稿 ({{ draftDocs.length }})
      </button>
    </div>

    <!-- 文档列表 -->
    <div class="docs-grid" v-if="!loading && filteredDocs.length > 0">
      <div 
        v-for="doc in filteredDocs" 
        :key="doc.id" 
        class="doc-card"
        @click="openDoc(doc.filename)"
      >
        <div class="doc-card-header">
          <h3 class="doc-title">{{ doc.title }}</h3>
          <span :class="['status-badge', doc.is_published ? 'published' : 'draft']">
            {{ doc.is_published ? '已发布' : '草稿' }}
          </span>
        </div>
        
        <div class="doc-meta">
          <span class="meta-item">
            <span class="meta-icon">📁</span>
            {{ doc.category || '未分类' }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">👁</span>
            {{ doc.view_count || 0 }} 次浏览
          </span>
        </div>
        
        <div class="doc-tags" v-if="doc.tags && doc.tags.length">
          <span v-for="tag in doc.tags.slice(0, 3)" :key="tag" class="tag tag-primary">
            {{ tag }}
          </span>
        </div>
        
        <div class="doc-footer">
          <span class="doc-time">
            更新于 {{ formatDate(doc.updated_at) }}
          </span>
          <div class="doc-actions">
            <button 
              class="action-btn" 
              @click.stop="togglePublish(doc)"
              :title="doc.is_published ? '取消发布' : '发布'"
            >
              {{ doc.is_published ? '📤' : '📥' }}
            </button>
            <button 
              class="action-btn delete" 
              @click.stop="handleDelete(doc)"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else-if="!loading">
      <div class="empty-icon">📄</div>
      <h3>{{ searchKeyword ? '没有找到相关文档' : '暂无文档' }}</h3>
      <p>{{ searchKeyword ? '尝试其他关键词' : '点击上方按钮创建第一篇文档' }}</p>
      <router-link v-if="!searchKeyword" to="/editor" class="btn btn-primary btn-lg mt-4">
        + 创建文档
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-else>
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDocsStore } from '../stores/docs'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const docsStore = useDocsStore()
const notify = useNotificationStore()

const { docs, loading, publishedDocs, draftDocs } = storeToRefs(docsStore)

const searchKeyword = ref('')
const searchResults = ref(null)
const currentFilter = ref('all')

const filteredDocs = computed(() => {
  let result = searchResults.value || docs.value
  
  if (currentFilter.value === 'published') {
    result = result.filter(d => d.is_published)
  } else if (currentFilter.value === 'draft') {
    result = result.filter(d => !d.is_published)
  }
  
  return result
})

onMounted(() => {
  docsStore.fetchDocs()
})

function openDoc(filename) {
  router.push(`/editor/${encodeURIComponent(filename)}`)
}

async function handleSearch() {
  if (!searchKeyword.value || searchKeyword.value.trim().length < 2) {
    searchResults.value = null
    return
  }
  
  try {
    searchResults.value = await docsStore.searchDocs(searchKeyword.value)
  } catch (error) {
    notify.error(error.message)
  }
}

function clearSearch() {
  searchKeyword.value = ''
  searchResults.value = null
}

async function togglePublish(doc) {
  // 如果是要发布文档，需要验证密码
  if (!doc.is_published) {
    const password = prompt('请输入主人密码以发布文档：')
    if (password !== 'yu153790') {
      notify.error('密码错误，无权发布文档')
      return
    }
  }
  
  try {
    await docsStore.updatePublishStatus(doc.id, !doc.is_published)
    notify.success(doc.is_published ? '已取消发布' : '已发布')
  } catch (error) {
    notify.error(error.message)
  }
}

async function handleDelete(doc) {
  if (!confirm(`确定要删除文档 "${doc.title}" 吗？`)) return
  
  try {
    await docsStore.deleteDoc(doc.filename)
    notify.success('文档已删除')
  } catch (error) {
    notify.error(error.message)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.home-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .search-input-wrapper {
    flex: 1;
    position: relative;
    
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem;
      font-size: 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
    
    .clear-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      opacity: 0.5;
      
      &:hover { opacity: 1; }
    }
  }
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  .filter-tab {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    font-size: 0.875rem;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius);
    transition: var(--transition);
    
    &:hover {
      background: var(--bg-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.doc-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .doc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }
  
  .doc-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.4;
  }
  
  .status-badge {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 9999px;
    flex-shrink: 0;
    
    &.published {
      background: rgba(72, 187, 120, 0.1);
      color: var(--success-color);
    }
    
    &.draft {
      background: rgba(237, 137, 54, 0.1);
      color: var(--warning-color);
    }
  }
  
  .doc-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
  }
  
  .doc-tags {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .doc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
    
    .doc-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .doc-actions {
      display: flex;
      gap: 0.25rem;
    }
    
    .action-btn {
      padding: 0.25rem 0.5rem;
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.6;
      transition: var(--transition);
      border-radius: var(--radius-sm);
      
      &:hover {
        opacity: 1;
        background: var(--bg-color);
      }
      
      &.delete:hover {
        background: rgba(245, 101, 101, 0.1);
      }
    }
  }
}

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.25rem;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-muted);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
