import request from '@/utils/request'
import type { StorageNode } from './types'

// 获取位置树（扁平列表）
export function getLocationTree() {
  return request.get<StorageNode[]>('/api/location/tree/')
}

// 获取位置节点列表
export function getLocationNodes() {
  return request.get<StorageNode[]>('/api/location/nodes/')
}

// 创建位置节点
export function createLocationNode(data: Partial<StorageNode>) {
  return request.post<StorageNode>('/api/location/nodes/', data)
}

// 更新位置节点
export function updateLocationNode(id: number, data: Partial<StorageNode>) {
  return request.put<StorageNode>(`/api/location/nodes/${id}/`, data)
}

// 删除位置节点
export function deleteLocationNode(id: number) {
  return request.delete(`/api/location/nodes/${id}/`)
}

