<template>
  <div class="location-management">
    <el-row :gutter="20">
      <!-- 左侧树形导航 -->
      <el-col :xs="24" :sm="8" :md="8">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>收纳位置</span>
              <el-button type="primary" size="small" @click="handleAddNode">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
          </template>

          <div v-if="locationStore.loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>

          <el-tree
            v-else
            :data="locationStore.treeData"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            node-key="id"
            :default-expand-all="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-actions">
                  <el-button text size="small" @click.stop="handleEditNode(data)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" type="danger" @click.stop="handleDeleteNode(data)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧详情 -->
      <el-col :xs="24" :sm="16" :md="16">
        <el-card v-if="selectedNode" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>{{ selectedNode.name }}</span>
            </div>
          </template>

          <div class="node-detail">
            <!-- 位置照片 -->
            <div v-if="selectedNode.image" class="node-image">
              <el-image :src="selectedNode.image" fit="cover" />
            </div>

            <!-- 位置信息 -->
            <div class="node-info">
              <div class="info-item">
                <span class="info-label">完整路径</span>
                <span class="info-value">{{ selectedNode.path_name }}</span>
              </div>
              <div v-if="selectedNode.description" class="info-item">
                <span class="info-label">备注</span>
                <div class="info-value notes">{{ selectedNode.description }}</div>
              </div>
            </div>

            <!-- 该位置下的谷子列表 -->
            <div class="guzi-list-section">
              <h3 class="section-title">该位置的谷子</h3>
              <div v-if="locationGuziList.length === 0" class="empty-guzi">
                <el-empty description="该位置暂无谷子" :image-size="100" />
              </div>
              <div v-else class="guzi-grid">
                <GoodsCard
                  v-for="goods in locationGuziList"
                  :key="goods.id"
                  :goods="goods"
                  @click="handleGuziClick"
                />
              </div>
            </div>
          </div>
        </el-card>

        <el-empty v-else description="请选择一个位置节点" />
      </el-col>
    </el-row>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="formData.name" placeholder="请输入位置名称" />
        </el-form-item>
        <el-form-item label="父节点">
          <el-tree-select
            v-model="formData.parent"
            :data="locationStore.treeData"
            placeholder="选择父节点（留空为根节点）"
            clearable
            :props="{ label: 'label', value: 'id' }"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.order" :min="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLocationStore } from '@/stores/location'
import { useGuziStore } from '@/stores/guzi'
import { createLocationNode, updateLocationNode, deleteLocationNode } from '@/api/location'
import GoodsCard from '@/components/GoodsCard.vue'
import GoodsDrawer from '@/components/GoodsDrawer.vue'
import type { StorageNode } from '@/api/types'
import type { TreeNode } from '@/utils/tree'

const locationStore = useLocationStore()
const guziStore = useGuziStore()

const selectedNode = ref<StorageNode | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingNodeId = ref<number | null>(null)

const formData = ref({
  name: '',
  parent: null as number | null,
  order: 0,
  description: '',
})

const dialogTitle = computed(() => (isEdit.value ? '编辑位置' : '新增位置'))

const locationGuziList = computed(() => {
  if (!selectedNode.value) return []
  return guziStore.guziList.filter(
    (goods: import('@/api/types').GoodsListItem) => goods.location_path?.includes(selectedNode.value!.name)
  )
})

const handleNodeClick = (data: TreeNode) => {
  if (data.data) {
    selectedNode.value = data.data
    // 加载该位置的谷子
    guziStore.searchGuzi({ location: data.id })
  }
}

const handleAddNode = () => {
  isEdit.value = false
  editingNodeId.value = null
  formData.value = {
    name: '',
    parent: null,
    order: 0,
    description: '',
  }
  dialogVisible.value = true
}

const handleEditNode = (data: TreeNode) => {
  if (!data.data) return
  isEdit.value = true
  editingNodeId.value = data.id
  formData.value = {
    name: data.data.name,
    parent: data.data.parent,
    order: data.data.order,
    description: data.data.description || '',
  }
  dialogVisible.value = true
}

const handleDeleteNode = async (data: TreeNode) => {
  if (!data.data) return
  try {
    await ElMessageBox.confirm('确定要删除这个位置吗？', '提示', {
      type: 'warning',
    })
    await deleteLocationNode(data.id)
    ElMessage.success('删除成功')
    await locationStore.fetchNodes()
    if (selectedNode.value?.id === data.id) {
      selectedNode.value = null
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入位置名称')
    return
  }

  try {
    if (isEdit.value && editingNodeId.value) {
      await updateLocationNode(editingNodeId.value, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createLocationNode(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await locationStore.fetchNodes()
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败')
  }
}

const handleDialogClose = () => {
  formData.value = {
    name: '',
    parent: null,
    order: 0,
    description: '',
  }
}

const handleGuziClick = (goods: any) => {
  // 可以打开详情抽屉
  // 这里简化处理
}

onMounted(async () => {
  await locationStore.fetchNodes()
})
</script>

<style scoped>
.location-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.tree-card,
.detail-card {
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: var(--primary-gold);
}

.loading-container {
  padding: 20px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding-right: 8px;
}

.node-label {
  flex: 1;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.node-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.node-image {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4/3;
  border-radius: var(--card-radius);
  overflow: hidden;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 16px;
}

.info-label {
  min-width: 80px;
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: var(--text-dark);
}

.notes {
  padding: 12px;
  background-color: var(--secondary-gray);
  border-radius: 8px;
  white-space: pre-wrap;
}

.guzi-list-section {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text-dark);
}

.empty-guzi {
  padding: 40px 20px;
  text-align: center;
}

.guzi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--secondary-gray);
}
</style>

