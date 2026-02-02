import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/EditorView.vue')
  },
  {
    path: '/editor/:filename',
    name: 'EditDoc',
    component: () => import('../views/EditorView.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesView.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
