import request from '@/utils/request'
import type { StorageNode, GoodsListItem, PaginatedResponse } from './types'

// 获取位置树（扁平列表）
export function getLocationTree() {
  return request.get<StorageNode[]>('/api/location/tree/')
}

// 获取位置节点列表
export function getLocationNodes() {
  return request.get<StorageNode[]>('/api/location/nodes/')
}

// 获取位置节点详情
export function getLocationNodeDetail(id: number) {
  return request.get<StorageNode>(`/api/location/nodes/${id}/`)
}

// 创建位置节点
export function createLocationNode(data: Partial<StorageNode>) {
  return request.post<StorageNode>('/api/location/nodes/', data)
}

// 完整更新位置节点
export function updateLocationNode(id: number, data: Partial<StorageNode>) {
  return request.put<StorageNode>(`/api/location/nodes/${id}/`, data)
}

// 部分更新位置节点
export function patchLocationNode(id: number, data: Partial<StorageNode>) {
  return request.patch<StorageNode>(`/api/location/nodes/${id}/`, data)
}

// 删除位置节点
export function deleteLocationNode(id: number) {
  return request.delete(`/api/location/nodes/${id}/`)
}

// 获取位置节点下的商品列表
export function getLocationNodeGoods(
  id: number,
  includeChildren: boolean = false,
  page?: number
) {
  return request.get<PaginatedResponse<GoodsListItem>>(
    `/api/location/nodes/${id}/goods/`,
    {
      params: {
        include_children: includeChildren,
        page,
      },
    }
  )
}

