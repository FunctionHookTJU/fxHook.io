import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useDocsStore = defineStore('docs', () => {
  // State
  const docs = ref([])
  const categories = ref([])
  const currentDoc = ref(null)
  const loading = ref(false)
  const stats = ref(null)

  // Getters
  const publishedDocs = computed(() => docs.value.filter(d => d.is_published))
  const draftDocs = computed(() => docs.value.filter(d => !d.is_published))
  
  const docsByCategory = computed(() => {
    const result = {}
    docs.value.forEach(doc => {
      const cat = doc.category || '未分类'
      if (!result[cat]) result[cat] = []
      result[cat].push(doc)
    })
    return result
  })

  // Actions
  async function fetchDocs() {
    loading.value = true
    try {
      const response = await api.getDocs()
      docs.value = response.data
    } catch (error) {
      console.error('获取文档列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchDoc(filename) {
    loading.value = true
    try {
      const response = await api.getDoc(filename)
      currentDoc.value = response.data
      return response.data
    } catch (error) {
      console.error('获取文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function saveDoc(filename, data) {
    try {
      const response = await api.saveDoc(filename, data)
      await fetchDocs()
      return response.data
    } catch (error) {
      console.error('保存文档失败:', error)
      throw error
    }
  }

  async function deleteDoc(filename) {
    try {
      await api.deleteDoc(filename)
      await fetchDocs()
      if (currentDoc.value?.filename === filename) {
        currentDoc.value = null
      }
    } catch (error) {
      console.error('删除文档失败:', error)
      throw error
    }
  }

  async function updatePublishStatus(id, isPublished) {
    try {
      await api.updateDocStatus(id, { is_published: isPublished })
      await fetchDocs()
    } catch (error) {
      console.error('更新发布状态失败:', error)
      throw error
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.getCategories()
      categories.value = response.data
    } catch (error) {
      console.error('获取分类失败:', error)
      throw error
    }
  }

  async function createCategory(name, description) {
    try {
      await api.createCategory({ name, description })
      await fetchCategories()
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    }
  }

  async function deleteCategory(name) {
    try {
      await api.deleteCategory(name)
      await fetchCategories()
    } catch (error) {
      console.error('删除分类失败:', error)
      throw error
    }
  }

  async function fetchStats() {
    try {
      const response = await api.getStats()
      stats.value = response.data
    } catch (error) {
      console.error('获取统计失败:', error)
      throw error
    }
  }

  async function syncDocs() {
    try {
      const response = await api.syncDocs()
      await fetchDocs()
      return response.data
    } catch (error) {
      console.error('同步失败:', error)
      throw error
    }
  }

  async function searchDocs(keyword) {
    try {
      const response = await api.searchDocs(keyword)
      return response.data
    } catch (error) {
      console.error('搜索失败:', error)
      throw error
    }
  }

  function clearCurrentDoc() {
    currentDoc.value = null
  }

  return {
    // State
    docs,
    categories,
    currentDoc,
    loading,
    stats,
    // Getters
    publishedDocs,
    draftDocs,
    docsByCategory,
    // Actions
    fetchDocs,
    fetchDoc,
    saveDoc,
    deleteDoc,
    updatePublishStatus,
    fetchCategories,
    createCategory,
    deleteCategory,
    fetchStats,
    syncDocs,
    searchDocs,
    clearCurrentDoc
  }
})
