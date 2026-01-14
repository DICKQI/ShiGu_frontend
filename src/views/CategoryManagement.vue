<template>
  <div class="category-management-container">
    <!-- ================= 顶部区域 ================= -->
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
    <!-- ================= 顶部区域结束 ================= -->

    <div v-loading="loading" class="content-body">
      <!-- 下拉刷新容器 -->
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
          
          <!-- 【PC端视图】 -->
          <div class="hidden-xs-only">
            <el-table :data="categoryList" style="width: 100%" class="pc-table">
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

          <!-- 【移动端视图】 -->
          <div class="visible-xs-only mobile-list-container">
            <div 
              v-for="item in categoryList" 
              :key="item.id" 
              class="mobile-card"
              @click="openMobileActions(item)"
            >
              <div class="mobile-card-left">
                <div class="icon-placeholder">
                  <el-icon><CollectionTag /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-name">{{ item.name }}</div>
                  <div class="card-id">ID: {{ item.id }}</div>
                </div>
              </div>
              <div class="mobile-card-right">
                <el-icon><MoreFilled /></el-icon>
              </div>
            </div>
          </div>
          
          <el-empty v-if="!loading && categoryList.length === 0" description="暂无品类数据" />
        </div>
      </div>
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

    <!-- 移动端底部操作面板 -->
    <el-drawer
      v-model="mobileDrawerVisible"
      direction="btt"
      :with-header="false"
      size="auto"
      class="mobile-action-drawer"
    >
      <div class="action-sheet-content">
        <div class="sheet-header">
          对 "{{ currentActionRow?.name }}" 进行操作
        </div>
        <div class="sheet-menu">
          <div class="sheet-item" @click="handleMobileEdit">
            <el-icon><Edit /></el-icon> 编辑品类
          </div>
          <div class="sheet-item danger" @click="handleMobileDelete">
            <el-icon><Delete /></el-icon> 删除品类
          </div>
        </div>
        <div class="sheet-cancel" @click="mobileDrawerVisible = false">取消</div>
      </div>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, CollectionTag, Refresh, Loading, Top, MoreFilled, Edit, Delete } from '@element-plus/icons-vue'
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

// 移动端操作相关
const mobileDrawerVisible = ref(false)
const currentActionRow = ref<Category | null>(null)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 下拉刷新相关状态
const scrollContainerRef = ref<HTMLElement | null>(null)
const startY = ref(0)
const pullDistance = ref(0)
const isRefreshing = ref(false)
const MAX_PULL = 80       
const TRIGGER_DIST = 50   

// ================== 核心修复逻辑开始 ==================

const getScrollTop = () => {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
}

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || isRefreshing.value) return
  
  // 核心修改：检测 window 的滚动高度，只有在页面最顶端时才记录触摸点
  if (getScrollTop() > 0) {
    startY.value = 0 // 确保非顶端时不记录有效起始点
    return
  }

  const firstTouch = e.touches?.[0]
  if (!firstTouch) return
  startY.value = firstTouch.clientY
}

const handleTouchMove = (e: TouchEvent) => {
  // 如果起始点无效（说明开始触摸时不在顶部），直接忽略
  if (!isMobile.value || isRefreshing.value || startY.value === 0) return
  
  // 双重保险：移动过程中如果页面被卷下去了，也不处理
  if (getScrollTop() > 0) return

  const firstTouch = e.touches?.[0]
  if (!firstTouch) return
  const currentY = firstTouch.clientY
  const distance = currentY - startY.value

  if (distance > 0) {
    // 只有在确定是下拉动作，且页面在顶部时，才阻止默认行为
    if (e.cancelable) e.preventDefault()
    pullDistance.value = Math.min(distance * 0.4, MAX_PULL)
  } else {
    pullDistance.value = 0
  }
}

// ================== 核心修复逻辑结束 ==================

const handleTouchEnd = async () => {
  if (!isMobile.value || isRefreshing.value) return
  if (pullDistance.value >= TRIGGER_DIST) {
    isRefreshing.value = true
    pullDistance.value = TRIGGER_DIST 
    try {
      await fetchCategoryList()
      ElMessage.success('刷新成功')
    } catch (error) {
      ElMessage.error('刷新失败')
    } finally {
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
        startY.value = 0
      }, 500)
    }
  } else {
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

const openMobileActions = (row: Category) => {
  currentActionRow.value = row
  mobileDrawerVisible.value = true
}

const handleMobileEdit = () => {
  if (currentActionRow.value) {
    handleEdit(currentActionRow.value)
    mobileDrawerVisible.value = false
  }
}

const handleMobileDelete = () => {
  if (currentActionRow.value) {
    mobileDrawerVisible.value = false
    handleDelete(currentActionRow.value)
  }
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
/* =========== PC/通用基础样式 =========== */
.category-management-container { 
  padding: 20px; 
  max-width: 1400px; 
  margin: 0 auto; 
  min-height: calc(100vh - 64px); 
}
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0; }
.sub-title { font-size: 13px; color: #909399; margin-top: 4px; display: block; }

.search-card { border-radius: 12px; border: none; margin-bottom: 20px; }
.search-flex { display: flex; gap: 8px; }
.custom-search { flex: 1; }

.add-btn, .search-btn, .submit-btn {
  background: linear-gradient(135deg, #a396ff 0%, #8e7dff 100%);
  border: none; border-radius: 8px;
}

.header-actions { display: flex; align-items: center; gap: 8px; }

/* PC端列表外壳 */
.category-list-wrapper { 
  background: #fff; 
  border-radius: 12px; 
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  position: relative;
  min-height: 200px;
}

.category-list-inner {
  transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  will-change: transform;
}

/* 下拉刷新样式 */
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

/* PC 表格样式 */
.category-item-name { display: flex; align-items: center; gap: 10px; font-weight: 500; color: #444; }
.folder-icon { color: #8e7dff; font-size: 18px; }
:deep(.id-column) { color: #c0c4cc; font-family: monospace; }
.action-inline { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.action-divider { display: inline-block; width: 1px; height: 16px; background: #e4e7ed; }

/* PC 刷新按钮 */
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
  transition: all 0.3s;
  z-index: 999;
}
.refresh-fab:hover { transform: scale(1.1) rotate(180deg); }
.refresh-fab .is-loading { animation: rotate 1s linear infinite; }

/* =========== 移动端适配样式 =========== */

.mobile-list-container {
  padding: 0;
  background-color: transparent; 
  border-radius: 0;
}

.mobile-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid #f2f3f5;
}

.mobile-card:active {
  background-color: #fafafa;
  transform: scale(0.98);
}

.mobile-card:last-child {
  margin-bottom: 0;
}

.mobile-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-placeholder {
  width: 40px;
  height: 40px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e7dff;
  font-size: 20px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-id {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.mobile-card-right {
  color: #ccc;
  font-size: 20px;
}

/* 底部动作面板样式 */
.action-sheet-content {
  background: #f8f8f8;
  padding-bottom: env(safe-area-inset-bottom);
}

.sheet-header {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: #909399;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.sheet-menu {
  background: #fff;
}

.sheet-item {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sheet-item:active {
  background: #f5f5f5;
}

.sheet-item.danger {
  color: #f56c6c;
}

.sheet-cancel {
  margin-top: 8px;
  background: #fff;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  color: #333;
}

.sheet-cancel:active {
  background: #f5f5f5;
}

/* 响应式断点控制 */
@media (max-width: 768px) {
  .category-management-container { padding: 16px; }
  .add-btn span { display: none; }
  .add-btn { width: 40px; height: 40px; border-radius: 50%; padding: 0; justify-content: center; }

  .sub-title { 
    font-size: 12px; 
    display: block; 
    margin-top: 4px; 
    line-height: 1.4;
    color: #909399;
    max-width: 260px;
  } 
  
  .hidden-xs-only { display: none !important; }
  
  .category-list-wrapper {
    box-shadow: none !important;
    background: transparent !important;
    padding: 0;
    min-height: auto;
  }
}

@media (min-width: 769px) {
  .visible-xs-only { display: none !important; }
}
</style>