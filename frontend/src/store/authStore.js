import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'

// Module-level promise prevents duplicate /auth/me calls (StrictMode + concurrent renders)
let initPromise = null

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),

      /**
       * Called once on app mount. Verifies the session with /auth/me.
       * Guards against StrictMode double-calls and concurrent callers.
       */
      initialize: () => {
        // Already verified this session — skip completely
        if (get().isInitialized) return Promise.resolve()

        // Already in-flight — return same promise (no second request)
        if (initPromise) return initPromise

        set({ isLoading: true })

        initPromise = authApi
          .getMe()
          .then(({ data }) => {
            set({
              user: data.data.user,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              error: null,
            })
          })
          .catch(() => {
            // 401 from /auth/me simply means "no valid session" — not an error
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true, // ← still mark as initialized so app can proceed
              isLoading: false,
            })
          })
          .finally(() => {
            initPromise = null
          })

        return initPromise
      },

      /** Login */
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.login(credentials)
          set({
            user: data.data.user,
            isAuthenticated: true,
            isInitialized: true,
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

      /** Register */
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.register(userData)
          set({
            user: data.data.user,
            isAuthenticated: true,
            isInitialized: true,
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
       * Logout — clears state but keeps isInitialized: true so the app
       * doesn't re-run initialize() and fire another /auth/me call.
       */
      logout: async () => {
        initPromise = null
        try {
          await authApi.logout()
        } catch {
          // Silent fail — still clear local state
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true, // ← stay true; no need to re-verify after explicit logout
            isLoading: false,
            error: null,
          })
        }
      },

      /** Update user in store without a network call */
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'eduflow-auth',
      storage: createJSONStorage(() => localStorage),
      // Persist identity only — isInitialized intentionally excluded
      // (must be re-verified on each fresh page load)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
