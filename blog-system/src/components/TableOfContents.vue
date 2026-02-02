<template>
  <div class="table-of-contents" :class="{ 'toc-sticky': sticky }">
    <div class="toc-header">
      <h3>目录</h3>
      <button class="toc-toggle" @click="toggleToc" v-if="isMobile">
        <span :class="{ 'rotated': isOpen }">▼</span>
      </button>
    </div>
    <div class="toc-content" :class="{ 'toc-open': isOpen || !isMobile }">
      <ul class="toc-list">
        <li
          v-for="item in tocItems"
          :key="item.id"
          :class="[
            'toc-item',
            `toc-level-${item.level}`,
            { 'toc-active': item.id === activeId }
          ]"
          @click="scrollToItem(item.id)"
        >
          {{ item.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToc, type TocItem } from '@composables/useToc'

interface Props {
  content: string
  sticky?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true
})

const { tocItems, activeId, parseToc, scrollToTocItem } = useToc()
const isOpen = ref(false)
const isMobile = ref(false)

const toggleToc = () => {
  isOpen.value = !isOpen.value
}

const scrollToItem = (id: string) => {
  scrollToTocItem(id)
  if (isMobile.value) {
    isOpen.value = false
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  tocItems.value = parseToc(props.content)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.table-of-contents {
  background: var(--toc-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.toc-sticky {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.toc-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--heading-color);
}

.toc-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  color: var(--text-color);
  transition: transform 0.3s;
}

.toc-toggle span {
  display: inline-block;
  transition: transform 0.3s;
}

.toc-toggle span.rotated {
  transform: rotate(180deg);
}

.toc-content {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-out;
}

.toc-content.toc-open {
  max-height: 1000px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  color: var(--text-color);
}

.toc-item:hover {
  background: var(--toc-hover-bg);
  color: var(--primary-color);
}

.toc-item.toc-active {
  background: var(--toc-active-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.toc-level-1 {
  font-size: 1rem;
  font-weight: 600;
}

.toc-level-2 {
  font-size: 0.9rem;
  padding-left: 1.5rem;
}

.toc-level-3 {
  font-size: 0.85rem;
  padding-left: 2.5rem;
}

.toc-level-4 {
  font-size: 0.8rem;
  padding-left: 3.5rem;
}

@media (max-width: 767px) {
  .table-of-contents {
    margin-bottom: 1rem;
  }

  .toc-sticky {
    position: static;
    max-height: none;
  }
}

:root {
  --toc-bg: var(--card-bg, #ffffff);
  --toc-hover-bg: rgba(52, 152, 219, 0.1);
  --toc-active-bg: rgba(52, 152, 219, 0.2);
  --border-color: #e0e0e0;
  --heading-color: #2c3e50;
  --text-color: #1a1a1a;
  --primary-color: #3498db;
}

[data-theme="dark"] {
  --toc-bg: #2d2d2d;
  --toc-hover-bg: rgba(93, 173, 226, 0.15);
  --toc-active-bg: rgba(93, 173, 226, 0.3);
  --border-color: #3a3a3a;
  --heading-color: #ffffff;
  --text-color: #e0e0e0;
  --primary-color: #5dade2;
}

[data-theme="sepia"] {
  --toc-bg: #faf3e8;
  --toc-hover-bg: rgba(139, 115, 85, 0.1);
  --toc-active-bg: rgba(139, 115, 85, 0.2);
  --border-color: #d4c4a8;
  --heading-color: #3d2e1f;
  --text-color: #5c4b37;
  --primary-color: #8b7355;
}
</style>
