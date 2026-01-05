import request from '@/utils/request'
import type { GoodsListItem, GoodsDetail, PaginatedResponse, GoodsSearchParams, GoodsInput } from './types'

// 获取谷子列表
export function getGoodsList(params?: GoodsSearchParams) {
  return request.get<PaginatedResponse<GoodsListItem>>('/api/goods/', { params })
}

// 获取谷子详情
export function getGoodsDetail(id: string) {
  return request.get<GoodsDetail>(`/api/goods/${id}/`)
}

// 创建谷子
export function createGoods(data: GoodsInput) {
  return request.post<GoodsDetail>('/api/goods/', data)
}

// 更新谷子
export function updateGoods(id: string, data: GoodsInput) {
  return request.put<GoodsDetail>(`/api/goods/${id}/`, data)
}

// 删除谷子
export function deleteGoods(id: string) {
  return request.delete(`/api/goods/${id}/`)
}

