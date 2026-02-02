import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-table-of-contents'
import hljs from 'markdown-it-highlightjs'
import container from 'markdown-it-container'
import matter from 'gray-matter'
import DOMPurify from 'dompurify'

export interface PostMetadata {
  title: string
  date: string
  tags: string[]
  cover?: string
  description?: string
  slug: string
}

export interface Post {
  metadata: PostMetadata
  content: string
  html: string
  toc: string
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

md.use(anchor, {
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '#',
    placement: 'before'
  }),
  level: [1, 2, 3, 4, 5, 6]
})

md.use(toc, {
  includeLevel: [1, 2, 3],
  containerClass: 'table-of-contents',
  slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
})

md.use(hljs, {
  auto: true,
  code: true
})

md.use(container, 'tip', {
  render: (tokens: any, idx: number) => {
    if (tokens[idx].nesting === 1) {
      return '<div class="tip-container">\n'
    } else {
      return '</div>\n'
    }
  }
})

md.use(container, 'warning', {
  render: (tokens: any, idx: number) => {
    if (tokens[idx].nesting === 1) {
      return '<div class="warning-container">\n'
    } else {
      return '</div>\n'
    }
  }
})

md.use(container, 'danger', {
  render: (tokens: any, idx: number) => {
    if (tokens[idx].nesting === 1) {
      return '<div class="danger-container">\n'
    } else {
      return '</div>\n'
    }
  }
})

export function useMarkdown() {
  const parseMarkdown = (raw: string, slug: string): Post => {
    const { data, content } = matter(raw)
    
    const metadata: PostMetadata = {
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      cover: data.cover || '',
      description: data.description || '',
      slug
    }
    
    const html = md.render(content)
    const cleanHtml = DOMPurify.sanitize(html)
    
    const tocHtml = md.render(content).match(/<div class="table-of-contents">[\s\S]*?<\/div>/)?.[0] || ''
    
    return {
      metadata,
      content,
      html: cleanHtml,
      toc: tocHtml
    }
  }

  const extractExcerpt = (content: string, maxLength: number = 200): string => {
    const plainText = content
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
    
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText
  }

  return {
    parseMarkdown,
    extractExcerpt
  }
}
