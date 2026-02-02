<template>
  <div class="markdown-renderer">
    <div v-html="html" class="markdown-content" @click="handleClick"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const html = computed(() => props.content)

const handleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    event.preventDefault()
    const id = target.getAttribute('href')?.slice(1)
    if (id) {
      const element = document.getElementById(id)
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
  }
}

watch(() => props.content, () => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll('pre code')
    codeBlocks.forEach((block) => {
      const pre = block.parentElement as HTMLElement
      if (pre && !pre.querySelector('.copy-button')) {
        const button = document.createElement('button')
        button.className = 'copy-button'
        button.textContent = 'Copy'
        button.addEventListener('click', async () => {
          const text = block.textContent || ''
          try {
            await navigator.clipboard.writeText(text)
            button.textContent = 'Copied!'
            setTimeout(() => {
              button.textContent = 'Copy'
            }, 2000)
          } catch (err) {
            console.error('Failed to copy:', err)
          }
        })
        pre.style.position = 'relative'
        pre.appendChild(button)
      }
    })
  })
}, { immediate: true })
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.8;
  color: var(--text-color);
}

.markdown-content :deep(h1) {
  font-size: 2.5rem;
  margin: 2rem 0 1rem;
  font-weight: 700;
  color: var(--heading-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 2rem;
  margin: 1.8rem 0 1rem;
  font-weight: 600;
  color: var(--heading-color);
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.8rem;
  font-weight: 600;
  color: var(--heading-color);
}

.markdown-content :deep(h4) {
  font-size: 1.25rem;
  margin: 1.2rem 0 0.6rem;
  font-weight: 600;
  color: var(--heading-color);
}

.markdown-content :deep(p) {
  margin: 1rem 0;
}

.markdown-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px dashed var(--primary-color);
  transition: all 0.2s;
}

.markdown-content :deep(a:hover) {
  color: var(--primary-hover);
  border-bottom-style: solid;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin: 0.5rem 0;
}

.markdown-content :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--primary-color);
  background: var(--blockquote-bg);
  color: var(--blockquote-color);
}

.markdown-content :deep(code) {
  background: var(--code-bg);
  color: var(--code-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  background: var(--pre-bg);
  border: 1px solid var(--border-color);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--pre-color);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--table-header-bg);
  font-weight: 600;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.markdown-content :deep(img:hover) {
  transform: scale(1.02);
}

.markdown-content :deep(.tip-container) {
  background: var(--tip-bg);
  border-left: 4px solid var(--tip-border);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.markdown-content :deep(.warning-container) {
  background: var(--warning-bg);
  border-left: 4px solid var(--warning-border);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.markdown-content :deep(.danger-container) {
  background: var(--danger-bg);
  border-left: 4px solid var(--danger-border);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.markdown-content :deep(.copy-button) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--button-bg);
  color: var(--button-color);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.markdown-content :deep(.copy-button:hover) {
  background: var(--button-hover);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--border-color);
  margin: 2rem 0;
}

:root {
  --text-color: #1a1a1a;
  --heading-color: #2c3e50;
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  --border-color: #e0e0e0;
  --code-bg: #f5f5f5;
  --code-color: #e74c3c;
  --pre-bg: #f8f9fa;
  --pre-color: #2c3e50;
  --blockquote-bg: #f8f9fa;
  --blockquote-color: #6c757d;
  --table-header-bg: #f8f9fa;
  --tip-bg: #d4edda;
  --tip-border: #28a745;
  --warning-bg: #fff3cd;
  --warning-border: #ffc107;
  --danger-bg: #f8d7da;
  --danger-border: #dc3545;
  --button-bg: #ffffff;
  --button-color: #2c3e50;
  --button-hover: #f0f0f0;
}

[data-theme="dark"] {
  --text-color: #e0e0e0;
  --heading-color: #ffffff;
  --primary-color: #5dade2;
  --primary-hover: #3498db;
  --border-color: #3a3a3a;
  --code-bg: #2d2d2d;
  --code-color: #ff6b6b;
  --pre-bg: #1e1e1e;
  --pre-color: #e0e0e0;
  --blockquote-bg: #2d2d2d;
  --blockquote-color: #a0a0a0;
  --table-header-bg: #2d2d2d;
  --tip-bg: #1e3a2e;
  --tip-border: #2ecc71;
  --warning-bg: #3a3a1e;
  --warning-border: #f1c40f;
  --danger-bg: #3a1e1e;
  --danger-border: #e74c3c;
  --button-bg: #2d2d2d;
  --button-color: #e0e0e0;
  --button-hover: #3a3a3a;
}

[data-theme="sepia"] {
  --text-color: #5c4b37;
  --heading-color: #3d2e1f;
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
  --border-color: #d4c4a8;
  --code-bg: #f4e8d8;
  --code-color: #8b4513;
  --pre-bg: #faf3e8;
  --pre-color: #5c4b37;
  --blockquote-bg: #f4e8d8;
  --blockquote-color: #8b7355;
  --table-header-bg: #f4e8d8;
  --tip-bg: #e8f5e0;
  --tip-border: #6b8e23;
  --warning-bg: #fff8e0;
  --warning-border: #daa520;
  --danger-bg: #f8e8e0;
  --danger-border: #cd5c5c;
  --button-bg: #faf3e8;
  --button-color: #5c4b37;
  --button-hover: #f4e8d8;
}
</style>
