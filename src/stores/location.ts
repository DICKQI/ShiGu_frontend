import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocationTree } from '@/api/location'
import type { StorageNode } from '@/api/types'
import { buildTree, getPathById as getPathByIdUtil, type TreeNode } from '@/utils/tree'

export const useLocationStore = defineStore('location', () => {
  // 状态
  const nodes = ref<StorageNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性：树结构
  const treeData = computed<TreeNode[]>(() => {
    if (nodes.value.length === 0) return []
    return buildTree(nodes.value)
  })

  // 获取位置树数据
  async function fetchNodes() {
    if (loading.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const data = await getLocationTree()
      nodes.value = data
    } catch (err: any) {
      error.value = err.message || '获取位置树失败'
      console.error('获取位置树失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取完整路径
  function getPathById(id: number): string {
    if (nodes.value.length === 0) return ''
    return getPathByIdUtil(nodes.value, id)
  }

  // 根据ID获取节点
  function getNodeById(id: number): StorageNode | undefined {
    return nodes.value.find((node) => node.id === id)
  }

  // 获取某个节点的所有子节点ID
  function getChildrenIds(parentId: number): number[] {
    const ids: number[] = [parentId]
    const findChildren = (id: number) => {
      nodes.value.forEach((node) => {
        if (node.parent === id) {
          ids.push(node.id)
          findChildren(node.id)
        }
      })
    }
    findChildren(parentId)
    return ids
  }

  return {
    nodes,
    loading,
    error,
    treeData,
    fetchNodes,
    getPathById,
    getNodeById,
    getChildrenIds,
  }
})

