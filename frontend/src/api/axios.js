import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor (passthrough) ───────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  failedQueue = []
}

// URLs that should NEVER trigger a token refresh attempt
const NO_REFRESH_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const is401 = error.response?.status === 401
    const alreadyRetried = originalRequest._retry === true
    // Don't refresh if the failing request is itself an auth endpoint
    const isAuthEndpoint = NO_REFRESH_URLS.some((url) =>
      originalRequest.url?.includes(url)
    )

    if (is401 && !alreadyRetried && !isAuthEndpoint) {
      // If a refresh is already in-flight, queue this request
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
        processQueue(refreshError)
        // Only dispatch logout if we have an active session to kill
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Toast on 5xx only (401 handled above, 422 handled by forms)
    if (error.response?.status >= 500) {
      const message = error.response?.data?.message
      toast.error(message || 'A server error occurred. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api
