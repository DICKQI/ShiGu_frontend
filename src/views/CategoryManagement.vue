<template>
  <div class="category-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>品类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增品类
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索品类名称"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <!-- PC端表格 -->
      <div v-loading="loading" class="table-container">
        <el-table :data="categoryList" stripe style="width: 100%" class="desktop-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="品类名称" min-width="200" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button text type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片列表 -->
        <div class="mobile-card-list">
          <div
            v-for="item in categoryList"
            :key="item.id"
            class="mobile-card"
          >
            <div class="card-header-section">
              <div class="card-title-row">
                <h3 class="card-name">{{ item.name }}</h3>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="handleEdit(item)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(item)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="!loading && categoryList.length === 0" description="暂无数据" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item label="品类名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入品类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/metadata'
import type { Category } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const searchText = ref('')
const categoryList = ref<Category[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const formData = ref({
  name: '',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入品类名称', trigger: 'blur' },
    { max: 50, message: '品类名称不能超过50个字符', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => (isEdit.value ? '编辑品类' : '新增品类'))

// 加载品类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }
    const data = await getCategoryList(params)
    categoryList.value = data
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchCategoryList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = { name: '' }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Category) => {
  isEdit.value = true
  editingId.value = row.id
  formData.value = { name: row.name }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除品类"${row.name}"吗？删除后该品类下的所有谷子数据将无法正常显示。`,
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      }
    )
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    await fetchCategoryList()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        await updateCategory(editingId.value, formData.value)
        ElMessage.success('更新成功')
      } else {
        await createCategory(formData.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      await fetchCategoryList()
    } catch (err: any) {
      ElMessage.error(err.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  formData.value = { name: '' }
}

onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.category-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.management-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: var(--primary-gold);
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.table-container {
  min-height: 400px;
}

:deep(.el-table) {
  border-radius: var(--card-radius);
  overflow: hidden;
}

:deep(.el-button.is-text) {
  padding: 4px 8px;
}

/* 移动端卡片布局 */
.mobile-card-list {
  display: none;
}

.mobile-card {
  background: #fff;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.mobile-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-header-section {
  margin-bottom: 8px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.card-actions .el-button {
  flex: 1;
}

/* 响应式：移动端显示卡片，PC端显示表格 */
@media (max-width: 768px) {
  .desktop-table {
    display: none !important;
  }

  .mobile-card-list {
    display: block;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar .el-input {
    width: 100% !important;
  }

  .search-bar .el-button {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header .el-button {
    width: 100%;
  }
}

@media (min-width: 769px) {
  .mobile-card-list {
    display: none !important;
  }

  .desktop-table {
    display: table !important;
  }
}

/* 弹窗 & 表单移动端适配 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
    border-radius: 0;
  }

  :deep(.el-dialog__body) {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
}
</style>

