declare module 'markdown-it-table-of-contents'
declare module 'markdown-it-container'
declare module 'markdown-it-anchor' {
  import MarkdownIt from 'markdown-it'
  const anchor: MarkdownIt.PluginWithOptions<{
    permalink?: boolean | {
      symbol?: string
      placement?: 'before' | 'after'
    }
    level?: number[]
    slugify?: (s: string) => string
    uniqueSlugStartIndex?: number
    tabIndex?: number | false
    callback?: (token: any, info: { slug: string }) => void
  }>
  export default anchor
  export const permalink: {
    linkInsideHeader: (opts?: {
      symbol?: string
      placement?: 'before' | 'after'
      class?: string
      ariaHidden?: boolean
    }) => any
  }
}

declare module 'markdown-it-highlightjs' {
  import MarkdownIt from 'markdown-it'
  const hljs: MarkdownIt.PluginWithOptions<{
    auto?: boolean
    code?: boolean
    register?: Record<string, any>
    inline?: boolean
  }>
  export default hljs
}

declare module 'gray-matter' {
  interface GrayMatterResult<T = Record<string, any>> {
    data: T
    content: string
    excerpt?: string
    orig?: string | Buffer
    language?: string
    matter?: string
  }
  function matter<T = Record<string, any>>(input: string | Buffer): GrayMatterResult<T>
  export = matter
}
