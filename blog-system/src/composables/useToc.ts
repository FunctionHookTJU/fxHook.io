import { ref, onMounted, onUnmounted } from 'vue'

export interface TocItem {
  id: string
  text: string
  level: number
}

export function useToc() {
  const tocItems = ref<TocItem[]>([])
  const activeId = ref('')

  const parseToc = (html: string): TocItem[] => {
    const items: TocItem[] = []
    const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g
    let match

    while ((match = regex.exec(html)) !== null) {
      items.push({
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, ''),
        level: parseInt(match[1])
      })
    }

    return items
  }

  const scrollToTocItem = (id: string) => {
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

  const updateActiveTocItem = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentId = ''

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect()
      if (rect.top <= 100) {
        currentId = heading.id
      }
    })

    activeId.value = currentId
  }

  onMounted(() => {
    window.addEventListener('scroll', updateActiveTocItem)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveTocItem)
  })

  return {
    tocItems,
    activeId,
    parseToc,
    scrollToTocItem
  }
}
