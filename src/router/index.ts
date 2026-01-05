import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/showcase',
  },
  {
    path: '/showcase',
    name: 'CloudShowcase',
    component: () => import('@/views/CloudShowcase.vue'),
    meta: {
      title: '云展柜',
    },
  },
  {
    path: '/location',
    name: 'Location',
    component: () => import('@/views/LocationManagement.vue'),
    meta: {
      title: '位置管理',
    },
  },
  {
    path: '/goods/new',
    name: 'GoodsNew',
    component: () => import('@/views/GoodsForm.vue'),
    meta: {
      title: '新增谷子',
    },
  },
  {
    path: '/goods/:id/edit',
    name: 'GoodsEdit',
    component: () => import('@/views/GoodsForm.vue'),
    meta: {
      title: '编辑谷子',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 拾谷 ShiGu` : '拾谷 ShiGu'
  next()
})

export default router
