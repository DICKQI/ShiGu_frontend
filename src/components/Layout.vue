<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="navbar-content">
        <div class="brand" @click="goHome">
          <span class="brand-text">✦ 拾谷 ShiGu</span>
        </div>
        <!-- 普通宽度下：直接展示完整菜单 -->
        <div class="nav-menu" v-if="!isMobile">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            @select="handleMenuSelect"
            class="nav-menu-el"
          >
            <el-menu-item index="/showcase">
              <el-icon><Grid /></el-icon>
              <span>云展柜</span>
            </el-menu-item>
            <el-menu-item index="/location">
              <el-icon><FolderOpened /></el-icon>
              <span>位置管理</span>
            </el-menu-item>
            <el-menu-item index="/ipcharacter">
              <el-icon><Collection /></el-icon>
              <span>IP作品与角色</span>
            </el-menu-item>
            <el-menu-item index="/category">
              <el-icon><Box /></el-icon>
              <span>品类管理</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 窄屏下：折叠为“更多 ...”下拉菜单 -->
        <div class="nav-menu nav-menu-compact" v-else>
          <el-dropdown trigger="click">
            <span class="more-trigger">
              <el-icon><MoreFilled /></el-icon>
              <span class="more-text">更多</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleMenuSelect('/showcase')">
                  <el-icon><Grid /></el-icon>
                  <span>云展柜</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleMenuSelect('/location')">
                  <el-icon><FolderOpened /></el-icon>
                  <span>位置管理</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleMenuSelect('/ipcharacter')">
                  <el-icon><Collection /></el-icon>
                  <span>IP作品与角色</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleMenuSelect('/category')">
                  <el-icon><Box /></el-icon>
                  <span>品类管理</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 悬浮按钮（仅云展柜页面展示） -->
    <div v-if="showFab" class="fab-btn" @click="goToAdd">
      <el-icon><Plus /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Grid, FolderOpened, Plus, Collection, User, Box, MoreFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isMobile = ref(window.innerWidth < 768)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/showcase')) return '/showcase'
  if (path.startsWith('/location')) return '/location'
  if (path.startsWith('/ipcharacter') || path.startsWith('/ip') || path.startsWith('/character')) return '/ipcharacter'
  if (path.startsWith('/category')) return '/category'
  return '/showcase'
})

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const goHome = () => {
  router.push('/showcase')
}

// 仅在云展柜页面显示“新增谷子”悬浮按钮
const showFab = computed(() => route.path.startsWith('/showcase'))

const goToAdd = () => {
  router.push('/goods/new')
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: var(--bg-white);
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(to right, transparent, var(--primary-gold), transparent) 1;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand {
  cursor: pointer;
  user-select: none;
}

.brand-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, var(--primary-gold), var(--primary-gold-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu-el {
  border-bottom: none;
  background: transparent;
}

:deep(.el-menu-item) {
  color: var(--text-dark);
  border-bottom: 2px solid transparent;
}

:deep(.el-menu-item:hover) {
  color: var(--primary-gold);
  background-color: transparent;
}

:deep(.el-menu-item.is-active) {
  color: var(--primary-gold);
  border-bottom-color: var(--primary-gold);
  background-color: transparent;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 64px);
}

.fab-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-gold), var(--primary-gold-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  box-shadow: var(--shadow-purple);
  cursor: pointer;
  transition: all var(--transition-normal);
  z-index: 999;
}

.fab-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 0 12px;
  }

  .brand-text {
    font-size: 20px;
  }

  .nav-menu-compact {
    justify-content: flex-end;
  }

  .more-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 999px;
    cursor: pointer;
    color: var(--text-dark);
    border: 1px solid rgba(0, 0, 0, 0.06);
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: all var(--transition-fast);
  }

  .more-trigger:hover {
    color: var(--primary-gold);
    border-color: rgba(212, 175, 55, 0.4);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
  }

  .more-text {
    font-size: 14px;
  }
}
</style>

