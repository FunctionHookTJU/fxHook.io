<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <span class="logo-icon">📝</span>
        <span class="logo-text">文档管理系统</span>
      </router-link>
    </div>
    
    <nav class="header-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">📚</span>
        <span>文档列表</span>
      </router-link>
      <router-link to="/editor" class="nav-item" :class="{ active: $route.path.startsWith('/editor') }">
        <span class="nav-icon">✏️</span>
        <span>编辑器</span>
      </router-link>
      <router-link to="/categories" class="nav-item" :class="{ active: $route.path === '/categories' }">
        <span class="nav-icon">📁</span>
        <span>分类管理</span>
      </router-link>
      <router-link to="/stats" class="nav-item" :class="{ active: $route.path === '/stats' }">
        <span class="nav-icon">📊</span>
        <span>统计</span>
      </router-link>
    </nav>
    
    <div class="header-right">
      <button class="btn btn-outline btn-sm" @click="syncDocs" :disabled="syncing">
        <span v-if="syncing">同步中...</span>
        <span v-else>🔄 同步文档</span>
      </button>
      <a href="/" class="btn btn-primary btn-sm" target="_blank">
        🏠 返回主站
      </a>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useNotificationStore } from '../stores/notification'

const docsStore = useDocsStore()
const notify = useNotificationStore()
const syncing = ref(false)

async function syncDocs() {
  syncing.value = true
  try {
    const result = await docsStore.syncDocs()
    notify.success(result.message)
  } catch (error) {
    notify.error(error.message)
  } finally {
    syncing.value = false
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: var(--shadow-md);
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.125rem;
    
    .logo-icon {
      font-size: 1.5rem;
    }
  }
}

.header-nav {
  display: flex;
  gap: 0.5rem;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    border-radius: var(--radius);
    transition: var(--transition);
    font-size: 0.875rem;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .nav-icon {
      font-size: 1rem;
    }
  }
}

.header-right {
  display: flex;
  gap: 0.75rem;
  
  .btn {
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
