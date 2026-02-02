import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'sepia'

const STORAGE_KEY = 'blog-theme'

// 全局共享状态，确保所有组件使用同一个 theme ref
const globalTheme = ref<Theme>(getInitialTheme())

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme
  if (stored && ['light', 'dark', 'sepia'].includes(stored)) {
    return stored
  }
  // 检测系统主题偏好
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function applyTheme(t: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', t)
  }
}

// 初始化时立即应用主题
applyTheme(globalTheme.value)

export function useTheme() {
  const theme = globalTheme

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')
  const isSepia = computed(() => theme.value === 'sepia')

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'sepia']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    theme,
    isDark,
    isLight,
    isSepia,
    setTheme,
    toggleTheme
  }
}
