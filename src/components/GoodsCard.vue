<template>
  <div
    class="goods-card"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
    @touchstart.stop="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @touchmove="handleTouchMove"
  >
    <!-- 状态标签：官谷/同人 -->
    <div class="attr-tag" :class="tagClass">
      <el-icon class="tag-icon">
        <CircleCheck v-if="goods.is_official" />
        <Brush v-else />
      </el-icon>
      <span class="tag-text">{{ tagText }}</span>
    </div>

    <!-- 主图 -->
    <div class="card-image">
      <el-image
        v-if="goods.main_photo"
        :src="goods.main_photo"
        :alt="goods.name"
        fit="cover"
        loading="lazy"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div v-else class="image-placeholder">
        <el-icon><Picture /></el-icon>
      </div>
    </div>

    <!-- 信息区 -->
    <div class="card-info">
      <div class="card-title" :title="goods.name">{{ goods.name }}</div>
      <div class="card-meta">
        <span class="meta-item">{{ goods.ip.short_name || goods.ip.name }}</span>
        <span class="meta-separator">·</span>
        <span class="meta-item">{{ goods.characters.map(c => c.name).join('、') }}</span>
        <span class="meta-separator">·</span>
        <span class="meta-item">{{ goods.category.name }}</span>
      </div>
      <div v-if="goods.location_path" class="card-location" @click.stop="handleLocationClick">
        <el-icon><Location /></el-icon>
        <span>{{ goods.location_path }}</span>
      </div>
      <div v-if="goods.quantity > 1" class="card-quantity">
        数量: {{ goods.quantity }}
      </div>
    </div>

    <!-- 右下角菜单按钮 -->
    <div 
      class="menu-button" 
      @click.stop="handleMenuButtonClick"
    >
      <el-icon><MoreFilled /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Picture, Location, CircleCheck, MoreFilled, Brush } from '@element-plus/icons-vue'
import type { GoodsListItem } from '@/api/types'

interface Props {
  goods: GoodsListItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [goods: GoodsListItem]
  locationClick: [path: string]
  contextMenu: [{ goods: GoodsListItem; x: number; y: number }]
}>()

const isLongPress = ref(false)
let longPressTimer: number | null = null

// 标签文本
const tagText = computed(() => {
  return props.goods.is_official ? '官谷' : '同人'
})

// 标签样式类
const tagClass = computed(() => {
  return {
    'tag-official': props.goods.is_official,
    'tag-unofficial': !props.goods.is_official
  }
})

const handleClick = () => {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }
  emit('click', props.goods)
}

const handleLocationClick = () => {
  emit('locationClick', props.goods.location_path)
}

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  emit('contextMenu', {
    goods: props.goods,
    x: event.clientX,
    y: event.clientY,
  })
}

const handleMenuButtonClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('contextMenu', {
    goods: props.goods,
    x: event.clientX,
    y: event.clientY,
  })
}

const clearLongPressTimer = () => {
  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const handleTouchStart = (event: TouchEvent) => {
  clearLongPressTimer()
  const touch = event.touches[0]
  if (!touch) return
  longPressTimer = window.setTimeout(() => {
    isLongPress.value = true
    const currentTouch = event.touches[0] || touch
    emit('contextMenu', {
      goods: props.goods,
      x: currentTouch.clientX,
      y: currentTouch.clientY,
    })
  }, 600)
}

const handleTouchEnd = () => {
  clearLongPressTimer()
}

const handleTouchMove = () => {
  clearLongPressTimer()
}

onBeforeUnmount(() => {
  clearLongPressTimer()
})
</script>

<style scoped>
.goods-card {
  background-color: var(--bg-white);
  border-radius: var(--card-radius);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.goods-card:focus,
.goods-card:active {
  outline: none;
}

.goods-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-gold);
}

/* 标签通用样式 */
.attr-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  z-index: 10;
  
  /* 磨砂玻璃效果核心 */
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  
  /* 阴影与文字阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.attr-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.tag-icon {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1)); 
}

/* 官谷样式 - 香槟金半透明 */
.tag-official {
  /* 使用 rgba 确保半透明：透明度约 0.8 */
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.85) 0%, rgba(184, 149, 31, 0.75) 100%);
}

/* 同人样式 - 镭射紫半透明 */
.tag-unofficial {
  /* 使用 rgba 确保半透明：透明度约 0.8 */
  background: linear-gradient(135deg, rgba(162, 155, 254, 0.85) 0%, rgba(108, 92, 231, 0.75) 100%);
}

.card-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background-color: var(--secondary-gray);
}

:deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-lighter);
  font-size: 48px;
  background-color: var(--secondary-gray);
}

.card-info {
  padding: 15px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-dark);
}

.card-meta {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.meta-separator {
  color: var(--text-lighter);
}

.card-location {
  font-size: 12px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 8px;
  background-color: var(--secondary-gray);
  border-radius: 4px;
  transition: all var(--transition-fast);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.card-location:focus,
.card-location:active {
  outline: none;
}

.card-location:hover {
  background-color: var(--primary-gold-light);
  color: var(--primary-gold-dark);
}

.card-quantity {
  font-size: 12px;
  color: var(--primary-gold);
  margin-top: 8px;
  font-weight: 500;
}

.menu-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 20;
  opacity: 0;
  transform: scale(0.8);
}

.goods-card:hover .menu-button {
  opacity: 1;
  transform: scale(1);
}

.menu-button:hover {
  background-color: var(--primary-gold-light);
  color: var(--primary-gold);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.menu-button:active {
  transform: scale(0.95);
}

.menu-button .el-icon {
  font-size: 18px;
  color: var(--text-dark);
  transition: color var(--transition-fast);
}

.menu-button:hover .el-icon {
  color: var(--primary-gold);
}

@media (max-width: 768px) {
  .attr-tag {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 11px;
  }

  .tag-icon {
    font-size: 12px;
  }

  .menu-button {
    bottom: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    opacity: 0.85;
    transform: scale(1);
  }

  .menu-button .el-icon {
    font-size: 16px;
  }
}
</style>

