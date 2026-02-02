<template>
  <button class="theme-toggle" @click="toggleTheme" :title="`当前主题: ${themeLabel}`">
    <span class="theme-icon">{{ themeIcon }}</span>
    <span class="theme-label">{{ themeLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme, type Theme } from '@composables/useTheme'

const { theme, toggleTheme } = useTheme()

const themeLabel = computed(() => {
  const labels: Record<Theme, string> = {
    light: '浅色',
    dark: '深色',
    sepia: '护眼'
  }
  return labels[theme.value]
})

const themeIcon = computed(() => {
  const icons: Record<Theme, string> = {
    light: '☀️',
    dark: '🌙',
    sepia: '📖'
  }
  return icons[theme.value]
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  font-size: 0.875rem;
}

.theme-toggle:hover {
  background: var(--button-hover);
  transform: scale(1.05);
}

.theme-icon {
  font-size: 1.25rem;
}

.theme-label {
  font-weight: 500;
}

@media (max-width: 767px) {
  .theme-label {
    display: none;
  }
}

:root {
  --button-bg: #ffffff;
  --button-hover: #f0f0f0;
  --border-color: #e0e0e0;
  --text-color: #1a1a1a;
}

[data-theme="dark"] {
  --button-bg: #2d2d2d;
  --button-hover: #3a3a3a;
  --border-color: #3a3a3a;
  --text-color: #e0e0e0;
}

[data-theme="sepia"] {
  --button-bg: #faf3e8;
  --button-hover: #f4e8d8;
  --border-color: #d4c4a8;
  --text-color: #5c4b37;
}
</style>
