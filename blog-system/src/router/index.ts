import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@views/HomeView.vue')
  },
  {
    path: '/post/:slug',
    name: 'Post',
    component: () => import('@views/PostView.vue')
  },
  {
    path: '/tag/:tag',
    name: 'Tag',
    component: () => import('@views/TagView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
