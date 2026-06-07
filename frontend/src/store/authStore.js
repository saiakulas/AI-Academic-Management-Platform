import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // ─── Actions ────────────────────────────────────────────
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      /**
       * Initialize auth state on app load — check if session is valid
       */
      initialize: async () => {
        if (get().isInitialized) return

        set({ isLoading: true })
        try {
          const { data } = await authApi.getMe()
          set({
            user: data.data.user,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
          })
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          })
        }
      },

      /**
       * Login
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.login(credentials)
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      /**
       * Register
       */
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.register(userData)
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true }
        } catch (err) {
          const errors = err.response?.data?.errors
          const message = err.response?.data?.message || 'Registration failed'
          set({ isLoading: false, error: message })
          return { success: false, message, errors }
        }
      },

      /**
       * Logout
       */
      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Silent fail — still clear local state
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      /**
       * Update user profile in store
       */
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'eduflow-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
