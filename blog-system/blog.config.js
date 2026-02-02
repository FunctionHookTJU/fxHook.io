export default {
  title: '我的博客',
  subtitle: '分享技术与思考',
  description: '基于 Vue 3 和 Markdown 的现代化博客系统',
  author: 'Your Name',
  url: 'https://yourdomain.com',
  
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    email: 'your.email@example.com'
  },

  posts: {
    perPage: 10,
    dateFormat: 'YYYY-MM-DD'
  },

  theme: {
    default: 'light',
    available: ['light', 'dark', 'sepia']
  },

  features: {
    toc: true,
    readingProgress: true,
    codeCopy: true,
    imageZoom: false
  }
}
