import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// API基础URL（根据实际后端地址配置）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  <T = any>(response: AxiosResponse<T>) => {
    return response.data
  },
  (error: any) => {
    // 处理限流错误
    if (error.response?.status === 429) {
      ElMessage.warning('搜索太快了，请稍后再试')
      return Promise.reject(error)
    }
    
    // 处理其他错误
    const message = error.response?.data?.detail || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 创建自定义请求接口，返回类型为 T 而不是 AxiosResponse<T>
interface CustomAxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

const request = axiosInstance as unknown as CustomAxiosInstance

export default request

