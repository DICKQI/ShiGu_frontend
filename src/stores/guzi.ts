import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGoodsList, getGoodsDetail } from '@/api/goods'
import type { GoodsListItem, GoodsDetail, GoodsSearchParams } from '@/api/types'
import { debounce } from 'lodash-es'

export const useGuziStore = defineStore('guzi', () => {
  // 状态
  const guziList = ref<GoodsListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<GoodsSearchParams>({})
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    page: 1,
  })

  // 内部搜索函数（不带防抖）
  const _searchGuzi = async (params?: GoodsSearchParams) => {
    if (loading.value) return

    loading.value = true
    error.value = null

    // 更新筛选条件
    if (params) {
      filters.value = { ...filters.value, ...params }
    }

    try {
      const response = await getGoodsList({
        ...filters.value,
        page: pagination.value.page,
      })
      
      console.log('API响应数据:', response)
      console.log('响应数据类型:', typeof response)
      console.log('是否为数组:', Array.isArray(response))
      console.log('results:', response?.results)
      console.log('results类型:', typeof response?.results)
      console.log('results是否为数组:', Array.isArray(response?.results))
      
      // 处理不同的响应格式
      let results: any[] = []
      let count = 0
      let next: string | null = null
      let previous: string | null = null
      
      // 如果响应本身就是数组（某些情况下可能直接返回数组）
      if (Array.isArray(response)) {
        results = response
        count = response.length
      }
      // 如果响应是分页对象
      else if (response && typeof response === 'object') {
        const responseObj = response as any
        // 检查是否有 results 字段
        if ('results' in responseObj) {
          results = Array.isArray(responseObj.results) ? responseObj.results : []
          count = typeof responseObj.count === 'number' ? responseObj.count : results.length
          next = responseObj.next || null
          previous = responseObj.previous || null
        }
        // 如果没有 results 字段，但响应是对象，可能是直接返回的数据
        else {
          console.warn('响应对象没有 results 字段，尝试直接使用:', responseObj)
          // 如果对象有 id 字段，可能是单个对象，包装成数组
          if (responseObj.id) {
            results = [responseObj]
            count = 1
          } else {
            results = []
            count = 0
          }
        }
      }
      // 其他情况
      else {
        console.warn('无法识别的响应格式:', response)
        results = []
        count = 0
      }
      
      // 更新数据
      guziList.value = results
      pagination.value = {
        count: count,
        next: next,
        previous: previous,
        page: pagination.value.page,
      }
      
      console.log('数据已更新，列表长度:', guziList.value.length)
      console.log('分页信息:', pagination.value)
      
      // 如果结果为空，清除错误信息（可能是正常的空结果）
      if (results.length === 0 && !error.value) {
        // 空结果不是错误，不需要设置错误信息
      }
    } catch (err: any) {
      error.value = err.message || '搜索失败'
      console.error('搜索谷子失败:', err)
      console.error('错误详情:', err.response?.data || err)
      guziList.value = []
    } finally {
      loading.value = false
    }
  }

  // 搜索谷子（带防抖，用于用户交互）
  const searchGuzi = debounce(_searchGuzi, 300)

  // 获取谷子详情
  async function fetchGoodsDetail(id: string): Promise<GoodsDetail | null> {
    try {
      const data = await getGoodsDetail(id)
      return data
    } catch (err: any) {
      error.value = err.message || '获取详情失败'
      console.error('获取谷子详情失败:', err)
      return null
    }
  }

  // 重置筛选条件
  function resetFilters() {
    filters.value = {}
    pagination.value.page = 1
    _searchGuzi()
  }

  // 设置页码
  function setPage(page: number) {
    pagination.value.page = page
    _searchGuzi()
  }

  // 立即搜索（用于首次加载）
  function searchGuziImmediate(params?: GoodsSearchParams) {
    return _searchGuzi(params)
  }

  return {
    guziList,
    loading,
    error,
    filters,
    pagination,
    searchGuzi,
    searchGuziImmediate,
    fetchGoodsDetail,
    resetFilters,
    setPage,
  }
})

