import axios from 'axios'
import { Message } from 'element-ui'
import router from '../router'
import mockHandler from '../mock/index' // 引入 mock

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 直接将适配器指向 mockHandler
service.defaults.adapter = (config) => {
  return mockHandler(config)
}
// ========================================

// 请求拦截器：携带 Token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器：统一处理错误
service.interceptors.response.use(response => {
  // 兼容 mock 数据和真实后端数据的结构
  return response.data || response
}, error => {
  if (error.response && error.response.status === 401) {
    Message.error('登录已过期，请重新登录')
    localStorage.removeItem('token')
    router.push('/login')
  } else {
    Message.error(error.response?.data?.message || '请求失败')
  }
  return Promise.reject(error)
})

export default service
