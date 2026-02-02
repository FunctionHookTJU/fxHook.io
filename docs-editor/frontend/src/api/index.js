import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default {
  // 文档
  getDocs: (published) => instance.get('/docs', { params: { published } }),
  getDoc: (filename) => instance.get(`/docs/${encodeURIComponent(filename)}`),
  saveDoc: (filename, data) => instance.post(`/docs/${encodeURIComponent(filename)}`, data),
  updateDocStatus: (id, data) => instance.patch(`/docs/${id}`, data),
  deleteDoc: (filename) => instance.delete(`/docs/${encodeURIComponent(filename)}`),
  searchDocs: (q) => instance.get('/docs/search', { params: { q } }),
  
  // 分类
  getCategories: () => instance.get('/categories'),
  createCategory: (data) => instance.post('/categories', data),
  deleteCategory: (name) => instance.delete(`/categories/${encodeURIComponent(name)}`),
  
  // 其他
  getStats: () => instance.get('/stats'),
  syncDocs: () => instance.post('/sync'),
  getSidebar: () => instance.get('/sidebar')
}
