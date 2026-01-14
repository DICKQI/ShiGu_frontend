<template>
  <div class="category-management-container">
    <div class="header-section">
      <div class="title-wrapper">
        <h2 class="page-title">品类管理</h2>
        <span class="sub-title">配置谷子的种类（如：立牌、马口铁徽章等）</span>
      </div>
      <div class="header-actions">
        <el-button class="add-btn" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          <span>新增品类</span>
        </el-button>
      </div>
    </div>

    <el-card class="search-card" shadow="never">
      <div class="search-flex">
        <el-input
          v-model="searchText"
          placeholder="搜索品类..."
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          class="custom-search"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button class="search-btn" type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </el-card>

    <div v-loading="loading" class="content-body">
      <!-- 统一使用简洁列表/表格 -->
      <div 
        class="category-list-wrapper pull-refresh-wrapper"
        ref="scrollContainerRef"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 下拉加载提示区 -->
        <div class="pull-indicator" :style="{ height: `${pullDistance}px`, opacity: pullDistance > 0 ? 1 : 0 }">
          <div class="indicator-content">
            <el-icon v-if="isRefreshing" class="is-loading"><Loading /></el-icon>
            <el-icon v-else :style="{ transform: `rotate(${pullDistance > 50 ? 180 : 0}deg)` }"><Top /></el-icon>
            <span class="indicator-text">
              {{ isRefreshing ? '正在刷新...' : (pullDistance > 50 ? '释放刷新' : '下拉刷新') }}
            </span>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="category-list-inner" :style="{ transform: `translateY(${pullDistance}px)` }">
          <el-table :data="categoryList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" align="center" class-name="id-column" />
          <el-table-column prop="name" label="品类名称">
            <template #default="{ row }">
              <div class="category-item-name">
                <el-icon class="folder-icon"><CollectionTag /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="right">
            <template #default="{ row }">
              <div class="action-inline">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <span class="action-divider" />
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        </div>
      </div>
      
      <el-empty v-if="!loading && categoryList.length === 0" />
    </div>

    <!-- 刷新按钮 - 右下角悬浮（仅PC端） -->
    <div class="refresh-fab hidden-xs-only" @click="handleRefresh" :class="{ loading: loading }">
      <el-icon v-if="!loading"><Refresh /></el-icon>
      <el-icon v-else class="is-loading"><Loading /></el-icon>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px" class="custom-dialog" align-center>
      <el-form :model="formData" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="品类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入品类名称，如：马口铁徽章" maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, CollectionTag, Refresh, Loading, Top } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/metadata'
import type { Category } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const searchText = ref('')
const categoryList = ref<Category[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

// 窗口宽度响应式
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 768)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 下拉刷新相关状态
const scrollContainerRef = ref<HTMLElement | null>(null)
const startY = ref(0)
const pullDistance = ref(0)
const isRefreshing = ref(false)
const MAX_PULL = 80       // 最大下拉距离
const TRIGGER_DIST = 50   // 触发刷新的阈值

// 下拉刷新逻辑
const handleTouchStart = (e: TouchEvent) => {
  // 如果不在移动端，或者正在刷新中，忽略
  if (!isMobile.value || isRefreshing.value) return
  
  // 只有当滚动条在顶部时才允许触发
  if (scrollContainerRef.value && scrollContainerRef.value.scrollTop > 0) return

  const firstTouch = e.touches?.[0]
  if (!firstTouch) return
  startY.value = firstTouch.clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || isRefreshing.value || startY.value === 0) return
  
  const firstTouch = e.touches?.[0]
  if (!firstTouch) return
  const currentY = firstTouch.clientY
  const distance = currentY - startY.value
  
  // 滚动条不在顶部，不处理
  if (scrollContainerRef.value && scrollContainerRef.value.scrollTop > 0) return

  if (distance > 0) {
    // 阻止原生滚动，防止冲突
    if (e.cancelable) e.preventDefault()
    
    // 增加阻尼效果，拉得越长越难拉
    pullDistance.value = Math.min(distance * 0.4, MAX_PULL)
  } else {
    pullDistance.value = 0
  }
}

const handleTouchEnd = async () => {
  if (!isMobile.value || isRefreshing.value) return
  
  if (pullDistance.value >= TRIGGER_DIST) {
    // 触发刷新
    isRefreshing.value = true
    pullDistance.value = TRIGGER_DIST // 停留在加载位置
    
    try {
      await fetchCategoryList()
      ElMessage.success('刷新成功')
    } catch (error) {
      ElMessage.error('刷新失败')
    } finally {
      // 延迟一下让动画自然
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
        startY.value = 0
      }, 500)
    }
  } else {
    // 距离不够，回弹
    pullDistance.value = 0
    startY.value = 0
  }
}

const formData = ref({ name: '' })
const formRules: FormRules = {
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '🏷️ 修改品类' : '✨ 新增品类')

const fetchCategoryList = async () => {
  loading.value = true
  try {
    const data = await getCategoryList({ search: searchText.value.trim() || undefined })
    categoryList.value = data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchCategoryList()
const handleRefresh = () => fetchCategoryList()
const handleAdd = () => { isEdit.value = false; formData.value.name = ''; dialogVisible.value = true; }
const handleEdit = (row: Category) => { isEdit.value = true; editingId.value = row.id; formData.value.name = row.name; dialogVisible.value = true; }

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(`确定删除品类《${row.name}》吗？`, '提示')
    await deleteCategory(row.id)
    ElMessage.success('已删除')
    fetchCategoryList()
  } catch {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        await updateCategory(editingId.value, formData.value)
      } else {
        await createCategory(formData.value)
      }
      dialogVisible.value = false
      fetchCategoryList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  fetchCategoryList()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>

<style scoped>
.category-management-container { 
  padding: 20px; 
  max-width: 1400px; 
  margin: 0 auto; 
  min-height: calc(100vh - 64px); 
}
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0; }
.sub-title { font-size: 13px; color: #909399; }

.search-card { border-radius: 12px; border: none; margin-bottom: 20px; }
.search-flex { display: flex; gap: 8px; }
.custom-search { flex: 1; }

.add-btn, .search-btn, .submit-btn {
  background: linear-gradient(135deg, #a396ff 0%, #8e7dff 100%);
  border: none; border-radius: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-list-wrapper { 
  background: #fff; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  position: relative;
}

@media (max-width: 768px) {
  .category-list-wrapper {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    max-height: calc(100vh - 200px);
  }
}

.category-list-inner {
  transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  will-change: transform;
}

/* 下拉刷新相关样式 */
.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.indicator-content {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
  padding-bottom: 10px;
}

.indicator-content .el-icon {
  font-size: 18px;
  transition: transform 0.3s;
}

.indicator-text {
  font-size: 14px;
  color: #909399;
}

/* 刷新按钮 - 右下角悬浮 */
.refresh-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #a396ff 0%, #8e7dff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  box-shadow: 0 4px 16px rgba(163, 150, 255, 0.4);
  cursor: pointer;
  transition: all var(--transition-normal);
  z-index: 999;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  border: none;
}

.refresh-fab:hover {
  transform: scale(1.1) rotate(180deg);
  box-shadow: 0 6px 20px rgba(163, 150, 255, 0.6);
}

.refresh-fab:focus,
.refresh-fab:active {
  outline: none;
}

.refresh-fab.loading {
  cursor: not-allowed;
  opacity: 0.8;
}

.refresh-fab .is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.category-item-name { display: flex; align-items: center; gap: 10px; font-weight: 500; color: #444; }
.folder-icon { color: #8e7dff; font-size: 18px; }
:deep(.id-column) { color: #c0c4cc; font-family: monospace; }

@media (max-width: 768px) {
  .add-btn span { display: none; }
  .add-btn { width: 40px; height: 40px; border-radius: 50%; padding: 0; }

  .hidden-xs-only {
    display: none !important;
  }
}

.action-inline { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.action-divider { display: inline-block; width: 1px; height: 16px; background: #e4e7ed; }
</style>