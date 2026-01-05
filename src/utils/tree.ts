import type { StorageNode } from '@/api/types'

// 树节点结构（用于el-tree）
export interface TreeNode {
  id: number
  label: string
  children?: TreeNode[]
  data?: StorageNode
}

/**
 * 将扁平的位置节点列表转换为树结构
 */
export function buildTree(nodes: StorageNode[]): TreeNode[] {
  const nodeMap = new Map<number, TreeNode>()
  const rootNodes: TreeNode[] = []

  // 第一遍：创建所有节点
  nodes.forEach((node) => {
    const treeNode: TreeNode = {
      id: node.id,
      label: node.name,
      data: node,
      children: [],
    }
    nodeMap.set(node.id, treeNode)
  })

  // 第二遍：建立父子关系
  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parent === null) {
      rootNodes.push(treeNode)
    } else {
      const parentNode = nodeMap.get(node.parent)
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = []
        }
        parentNode.children.push(treeNode)
      }
    }
  })

  // 排序：按order字段排序
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const orderA = a.data?.order ?? 0
      const orderB = b.data?.order ?? 0
      return orderA - orderB
    })
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    })
  }

  sortNodes(rootNodes)
  return rootNodes
}

/**
 * 根据ID获取完整路径字符串
 */
export function getPathById(nodes: StorageNode[], id: number): string {
  const nodeMap = new Map<number, StorageNode>()
  nodes.forEach((node) => nodeMap.set(node.id, node))

  const path: string[] = []
  let currentNode: StorageNode | undefined = nodeMap.get(id)

  while (currentNode) {
    path.unshift(currentNode.name)
    if (currentNode.parent === null) {
      break
    }
    currentNode = nodeMap.get(currentNode.parent)
  }

  return path.join(' > ')
}

