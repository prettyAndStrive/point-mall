import axios from 'axios'
import { Message } from 'element-ui'
import router from '../router'
import mockHandler from '../mock/index' // 引入 mock

const service = axios.create({
  // 开发环境走 vue.config.js 的本地代理；生产环境由部署平台注入完整 API 地址。
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  timeout: 5000
})

// 直接将适配器指向 mockHandler
if (process.env.VUE_APP_USE_MOCK !== 'false') {
  service.defaults.adapter = (config) => mockHandler(config)
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
  const payload = response.data || response
  if (payload && payload.code && payload.code !== 200) {
    const error = new Error(payload.msg || payload.message || '请求失败')
    error.response = response
    return Promise.reject(error)
  }
  return payload
}, error => {
  if (error.response && error.response.status === 401) {
    Message.error('登录已过期，请重新登录')
    localStorage.removeItem('token')
    router.push('/login')
  } else {
    Message.error(error.response?.data?.msg || error.response?.data?.message || error.message || '请求失败')
  }
  return Promise.reject(error)
})

export default service
