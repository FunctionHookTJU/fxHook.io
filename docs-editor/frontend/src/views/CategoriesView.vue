<template>
  <div class="categories-view">
    <div class="page-header">
      <h1>📁 分类管理</h1>
      <p class="page-desc">管理文档分类，让文档更有条理</p>
    </div>

    <!-- 新建分类 -->
    <div class="card mb-4">
      <div class="card-body">
        <h3 class="mb-3">新建分类</h3>
        <div class="create-form">
          <input 
            v-model="newCategoryName" 
            type="text" 
            class="input"
            placeholder="分类名称"
          >
          <input 
            v-model="newCategoryDesc" 
            type="text" 
            class="input"
            placeholder="分类描述（可选）"
          >
          <button class="btn btn-primary" @click="handleCreate">
            + 创建分类
          </button>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="categories-grid">
      <div 
        v-for="cat in categories" 
        :key="cat.id" 
        class="category-card"
      >
        <div class="category-icon">📁</div>
        <div class="category-info">
          <h3 class="category-name">{{ cat.name }}</h3>
          <p class="category-desc">{{ cat.description || '暂无描述' }}</p>
          <div class="category-meta">
            <span class="doc-count">{{ cat.doc_count || 0 }} 篇文档</span>
          </div>
        </div>
        <button 
          v-if="cat.name !== '未分类'"
          class="delete-btn" 
          @click="handleDelete(cat)"
          title="删除分类"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <h3>暂无分类</h3>
      <p>创建第一个分类来组织你的文档</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocsStore } from '../stores/docs'
import { useNotificationStore } from '../stores/notification'

const docsStore = useDocsStore()
const notify = useNotificationStore()

const { categories } = storeToRefs(docsStore)

const newCategoryName = ref('')
const newCategoryDesc = ref('')

onMounted(() => {
  docsStore.fetchCategories()
})

async function handleCreate() {
  if (!newCategoryName.value.trim()) {
    notify.warning('请输入分类名称')
    return
  }
  
  try {
    await docsStore.createCategory(newCategoryName.value.trim(), newCategoryDesc.value.trim())
    notify.success('分类创建成功')
    newCategoryName.value = ''
    newCategoryDesc.value = ''
  } catch (error) {
    notify.error(error.message)
  }
}

async function handleDelete(cat) {
  if (!confirm(`确定要删除分类 "${cat.name}" 吗？该分类下的文档将变为"未分类"`)) return
  
  try {
    await docsStore.deleteCategory(cat.name)
    notify.success('分类已删除')
  } catch (error) {
    notify.error(error.message)
  }
}
</script>

<style lang="scss" scoped>
.categories-view {
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

.create-form {
  display: flex;
  gap: 1rem;
  
  .input {
    flex: 1;
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  position: relative;
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
    
    .delete-btn {
      opacity: 1;
    }
  }
  
  .category-icon {
    font-size: 2.5rem;
  }
  
  .category-info {
    flex: 1;
    
    .category-name {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .category-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    
    .doc-count {
      font-size: 0.75rem;
      color: var(--primary-color);
      background: rgba(102, 126, 234, 0.1);
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }
  }
  
  .delete-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0;
    transition: var(--transition);
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    
    &:hover {
      background: rgba(245, 101, 101, 0.1);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-muted);
  }
}
</style>
