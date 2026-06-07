import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Token is handled via httpOnly cookies automatically.
    // For Bearer-based auth (e.g. React Native), attach from store here.
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh') {
        // Refresh itself failed — force logout
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Show toast for server errors (not 401 — handled by auth)
    const message = error.response?.data?.message
    if (error.response?.status >= 500) {
      toast.error(message || 'A server error occurred. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api
