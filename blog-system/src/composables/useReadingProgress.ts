import { ref, onMounted, onUnmounted } from 'vue'

export function useReadingProgress() {
  const progress = ref(0)

  const updateProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrollPercentage = (scrollTop / scrollHeight) * 100
    progress.value = Math.min(100, Math.max(0, scrollPercentage))
  }

  onMounted(() => {
    window.addEventListener('scroll', updateProgress)
    updateProgress()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress)
  })

  return {
    progress
  }
}
