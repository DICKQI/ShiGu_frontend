import request from '@/utils/request'
import type { IP, Character, Category } from './types'

// 获取所有IP列表
export function getIPList() {
  return request.get<IP[]>('/api/ips/')
}

// 获取所有角色列表
export function getCharacterList() {
  return request.get<Character[]>('/api/characters/')
}

// 根据IP获取角色列表
export function getCharactersByIP(ipId: number) {
  return request.get<Character[]>(`/api/characters/?ip=${ipId}`)
}

// 获取所有品类列表
export function getCategoryList() {
  return request.get<Category[]>('/api/categories/')
}

