<template>
  <div class="editor-view">
    <!-- 编辑器工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <router-link to="/" class="btn btn-outline">
          ← 返回列表
        </router-link>
        <div class="filename-input">
          <input 
            v-model="filename" 
            type="text" 
            class="input"
            placeholder="文件名.md"
          >
        </div>
      </div>
      
      <div class="toolbar-center">
        <input 
          v-model="docTitle" 
          type="text" 
          class="title-input"
          placeholder="文档标题"
        >
      </div>
      
      <div class="toolbar-right">
        <select v-model="category" class="input category-select">
          <option value="">选择分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">
            {{ cat.name }}
          </option>
        </select>
        
        <button 
          class="btn btn-success" 
          @click="saveDocument"
          :disabled="saving"
        >
          <span v-if="saving">保存中...</span>
          <span v-else>💾 保存</span>
        </button>
        
        <button 
          v-if="isEditing"
          class="btn btn-primary" 
          @click="saveAndPublish"
          :disabled="saving"
        >
          📤 发布
        </button>
      </div>
    </div>

    <!-- Markdown 编辑器 -->
    <div class="editor-container">
      <MdEditor
        v-model="content"
        :theme="theme"
        language="zh-CN"
        :toolbars="toolbars"
        :preview="true"
        @onSave="saveDocument"
        style="height: 100%"
      />
    </div>

    <!-- 标签输入 -->
    <div class="tags-bar">
      <span class="tags-label">标签：</span>
      <div class="tags-list">
        <span 
          v-for="(tag, index) in tags" 
          :key="index" 
          class="tag tag-primary"
        >
          {{ tag }}
          <button class="tag-remove" @click="removeTag(index)">×</button>
        </span>
      </div>
      <input 
        v-model="newTag"
        type="text" 
        class="tag-input"
        placeholder="添加标签后按回车"
        @keyup.enter="addTag"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useDocsStore } from '../stores/docs'
import { useNotificationStore } from '../stores/notification'

const route = useRoute()
const router = useRouter()
const docsStore = useDocsStore()
const notify = useNotificationStore()

const { categories } = storeToRefs(docsStore)

// 编辑器状态
const content = ref('# 新文档\n\n在这里开始编写...')
const filename = ref('')
const docTitle = ref('')
const category = ref('')
const tags = ref([])
const newTag = ref('')
const saving = ref(false)
const theme = ref('light')

// 工具栏配置
const toolbars = [
  'bold', 'underline', 'italic', 'strikeThrough', '-',
  'title', 'sub', 'sup', 'quote', '-',
  'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table', '-',
  'revoke', 'next', '=',
  'preview', 'htmlPreview', 'catalog'
]

const isEditing = computed(() => !!route.params.filename)

onMounted(async () => {
  await docsStore.fetchCategories()
  
  if (route.params.filename) {
    await loadDocument(route.params.filename)
  }
})

watch(() => route.params.filename, async (newFilename) => {
  if (newFilename) {
    await loadDocument(newFilename)
  } else {
    resetEditor()
  }
})

async function loadDocument(docFilename) {
  try {
    const doc = await docsStore.fetchDoc(docFilename)
    content.value = doc.content || ''
    filename.value = doc.filename || ''
    docTitle.value = doc.title || ''
    category.value = doc.category || ''
    tags.value = doc.tags || []
  } catch (error) {
    notify.error('加载文档失败: ' + error.message)
    router.push('/')
  }
}

function resetEditor() {
  content.value = '# 新文档\n\n在这里开始编写...'
  filename.value = ''
  docTitle.value = ''
  category.value = ''
  tags.value = []
}

async function saveDocument() {
  if (!filename.value) {
    notify.warning('请输入文件名')
    return
  }
  
  if (!filename.value.endsWith('.md')) {
    filename.value += '.md'
  }
  
  saving.value = true
  try {
    await docsStore.saveDoc(filename.value, {
      content: content.value,
      title: docTitle.value || extractTitle(content.value) || filename.value.replace('.md', ''),
      category: category.value || '未分类',
      tags: tags.value
    })
    notify.success('保存成功')
    
    if (!isEditing.value) {
      router.replace(`/editor/${encodeURIComponent(filename.value)}`)
    }
  } catch (error) {
    notify.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

async function saveAndPublish() {
  await saveDocument()
  // 获取文档ID并发布
  const doc = docsStore.docs.find(d => d.filename === filename.value)
  if (doc && !doc.is_published) {
    try {
      await docsStore.updatePublishStatus(doc.id, true)
      notify.success('文档已发布')
    } catch (error) {
      notify.error('发布失败: ' + error.message)
    }
  }
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
  }
  newTag.value = ''
}

function removeTag(index) {
  tags.value.splice(index, 1)
}

function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

// 快捷键
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
})
</script>

<style lang="scss" scoped>
.editor-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .filename-input {
      width: 200px;
      
      .input {
        font-family: monospace;
      }
    }
  }
  
  .toolbar-center {
    flex: 1;
    max-width: 400px;
    
    .title-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      text-align: center;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .category-select {
      width: 140px;
    }
  }
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.tags-bar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  gap: 0.5rem;
  
  .tags-label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    .tag-remove {
      background: none;
      border: none;
      padding: 0;
      margin-left: 0.25rem;
      cursor: pointer;
      opacity: 0.6;
      
      &:hover { opacity: 1; }
    }
  }
  
  .tag-input {
    flex: 1;
    min-width: 120px;
    max-width: 200px;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px dashed var(--border-color);
    border-radius: var(--radius);
    background: transparent;
    
    &:focus {
      outline: none;
      border-style: solid;
      border-color: var(--primary-color);
    }
  }
}
</style>
