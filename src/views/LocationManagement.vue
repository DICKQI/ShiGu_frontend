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
              <div class="section-header">
                <h3 class="section-title">
                  该位置的谷子
                  <span v-if="selectedNode" class="debug-info">(节点ID: {{ selectedNode.id }}, 商品数: {{ locationGuziList.length }})</span>
                </h3>
                <el-switch
                  v-model="includeChildren"
                  active-text="包含子节点"
                  inactive-text="仅当前节点"
                  @change="handleIncludeChildrenChange"
                />
              </div>
              <div v-if="goodsLoading" class="loading-guzi">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="locationGuziList.length === 0" class="empty-guzi">
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" label-width="100px" label-position="left">
        <el-form-item label="位置名称" required>
          <el-input 
            v-model="formData.name" 
            placeholder="请输入位置名称，如：第一层、抽屉A等"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="父节点位置">
          <div class="parent-select-wrapper">
            <el-tree-select
              v-model="formData.parent"
              :data="parentNodeOptions"
              placeholder="选择父节点（留空则创建为根节点）"
              clearable
              :props="{ 
                label: 'label', 
                value: 'id', 
                children: 'children'
              }"
              check-strictly
              style="width: 100%"
              filterable
              :filter-method="filterParentNodes"
            />
            <!-- <div class="form-tip">
              <el-icon><InfoFilled /></el-icon>
            </div> -->
          </div>
        </el-form-item>
        
        <el-form-item label="显示顺序">
          <el-input-number 
            v-model="formData.order" 
            :min="0" 
            :max="9999"
            placeholder="数字越小越靠前，默认为0"
            style="width: 100%"
          />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>同级节点按此数值排序，数值越小越靠前显示</span>
          </div>
        </el-form-item>
        
        <el-form-item label="备注说明">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="可选，如：靠窗的那一侧、常用物品存放处等"
            maxlength="500"
            show-word-limit
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
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLocationStore } from '@/stores/location'
import {
  createLocationNode,
  updateLocationNode,
  patchLocationNode,
  deleteLocationNode,
  getLocationNodeDetail,
  getLocationNodeGoods,
} from '@/api/location'
import GoodsCard from '@/components/GoodsCard.vue'
import GoodsDrawer from '@/components/GoodsDrawer.vue'
import type { StorageNode, GoodsListItem } from '@/api/types'
import type { TreeNode } from '@/utils/tree'

const locationStore = useLocationStore()

const selectedNode = ref<StorageNode | null>(null)
const locationGuziList = ref<GoodsListItem[]>([])
const goodsLoading = ref(false)
const includeChildren = ref(true)
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

// 计算可选的父节点列表（编辑时需要排除当前节点及其子节点，避免循环引用）
const parentNodeOptions = computed(() => {
  const treeData = locationStore.treeData
  if (!isEdit.value || !editingNodeId.value) {
    // 新建时，所有节点都可以作为父节点
    return treeData
  }
  
  // 编辑时，需要排除当前节点及其所有子节点，避免循环引用
  const excludeIds = locationStore.getChildrenIds(editingNodeId.value)
  
  // 递归过滤树节点
  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .filter((node) => !excludeIds.includes(node.id))
      .map((node) => ({
        ...node,
        children: node.children && node.children.length > 0 ? filterTree(node.children) : undefined,
      }))
  }
  
  return filterTree(treeData)
})

// 过滤父节点（用于搜索）
const filterParentNodes = (query: string, node: TreeNode) => {
  if (!query) return true
  const label = node.label || ''
  const pathName = node.data?.path_name || ''
  return label.toLowerCase().includes(query.toLowerCase()) || 
         pathName.toLowerCase().includes(query.toLowerCase())
}

const handleNodeClick = async (data: TreeNode) => {
  if (!data.data) return
  
  try {
    // 获取节点详情
    const nodeDetail = await getLocationNodeDetail(data.id)
    selectedNode.value = nodeDetail
    
    // 加载该位置的谷子
    await loadNodeGoods(data.id, includeChildren.value)
  } catch (err: any) {
    ElMessage.error(err.message || '获取节点详情失败')
  }
}

const loadNodeGoods = async (nodeId: number, includeChildrenFlag: boolean = false) => {
  if (!nodeId) return
  
  goodsLoading.value = true
  try {
    const response = await getLocationNodeGoods(nodeId, includeChildrenFlag)
    console.log('商品列表响应:', response)
    console.log('响应类型:', typeof response)
    console.log('是否为数组:', Array.isArray(response))
    
    // 处理不同的响应格式（参考 guzi store 的处理方式）
    let results: GoodsListItem[] = []
    
    // 如果响应本身就是数组
    if (Array.isArray(response)) {
      results = response
    }
    // 如果响应是分页对象
    else if (response && typeof response === 'object') {
      const responseObj = response as any
      // 检查是否有 results 字段
      if ('results' in responseObj && Array.isArray(responseObj.results)) {
        results = responseObj.results
      }
      // 如果没有 results 字段，可能是直接返回的数据对象
      else if (responseObj.id) {
        // 单个对象，包装成数组
        results = [responseObj]
      }
    }
    
    locationGuziList.value = results
    console.log('最终设置的商品列表:', locationGuziList.value)
    console.log('商品数量:', locationGuziList.value.length)
  } catch (err: any) {
    console.error('获取商品列表错误:', err)
    ElMessage.error(err.message || '获取商品列表失败')
    locationGuziList.value = []
  } finally {
    goodsLoading.value = false
  }
}

const handleIncludeChildrenChange = (value: boolean) => {
  if (selectedNode.value) {
    loadNodeGoods(selectedNode.value.id, value)
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
  
  // 检查是否有子节点
  const childrenIds = locationStore.getChildrenIds(data.id)
  const hasChildren = childrenIds.length > 1 // 包含自己，所以 > 1 表示有子节点
  
  const message = hasChildren
    ? `删除此位置将同时删除所有子节点（共 ${childrenIds.length - 1} 个子节点），并取消关联商品的 location 关联。确定要继续吗？`
    : '确定要删除这个位置吗？删除后，关联商品的 location 字段将被设置为空。'
  
  try {
    await ElMessageBox.confirm(message, '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    await deleteLocationNode(data.id)
    ElMessage.success('删除成功')
    await locationStore.fetchNodes()
    if (selectedNode.value?.id === data.id) {
      selectedNode.value = null
      locationGuziList.value = []
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
      // 使用 PATCH 进行部分更新，只发送有变化的字段
      const updateData: Partial<StorageNode> = {}
      if (formData.value.name) updateData.name = formData.value.name
      if (formData.value.parent !== undefined) updateData.parent = formData.value.parent
      if (formData.value.order !== undefined) updateData.order = formData.value.order
      if (formData.value.description !== undefined) updateData.description = formData.value.description
      
      await patchLocationNode(editingNodeId.value, updateData)
      ElMessage.success('更新成功')
    } else {
      await createLocationNode(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await locationStore.fetchNodes()
    
    // 如果更新的是当前选中的节点，重新加载详情
    if (isEdit.value && editingNodeId.value === selectedNode.value?.id) {
      const nodeDetail = await getLocationNodeDetail(editingNodeId.value)
      selectedNode.value = nodeDetail
      await loadNodeGoods(editingNodeId.value, includeChildren.value)
    }
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 8px;
}

.debug-info {
  font-size: 12px;
  font-weight: normal;
  color: var(--text-light);
  opacity: 0.7;
}

.loading-guzi {
  padding: 20px;
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

/* 表单样式 */
.parent-select-wrapper {
  width: 100%;
}

.tree-select-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.tree-select-node .node-label {
  flex: 1;
  font-weight: 500;
}

.tree-select-node .node-path {
  font-size: 12px;
  color: var(--text-light);
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.form-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: var(--secondary-gray);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.5;
}

.form-tip .el-icon {
  margin-top: 2px;
  color: var(--primary-gold);
  flex-shrink: 0;
}

.form-tip span {
  flex: 1;
}

/* 树选择器样式优化 */
:deep(.el-tree-select__popper) {
  .el-tree-node__content {
    padding: 8px 12px;
  }
  
  .el-tree-node__label {
    font-size: 14px;
  }
  
  .el-tree-node__expand-icon {
    padding: 4px;
  }
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
}
</style>

