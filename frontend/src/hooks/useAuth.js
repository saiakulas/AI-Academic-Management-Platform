import { useEffect, useRef } from 'react'
import useAuthStore from '@/store/authStore'

/**
 * Initializes auth state exactly once on app mount.
 *
 * - Calls /auth/me to verify the session cookie is still valid.
 * - Listens for 'auth:session-expired' events dispatched by the axios
 *   interceptor when a token refresh fails mid-session (e.g. cookie expired
 *   while the user was active). This is different from the initial load 401.
 * - The ref guard prevents React StrictMode's double-invoke from
 *   firing two /auth/me calls in development.
 */
export function useAuthInit() {
  const initialize = useAuthStore((s) => s.initialize)
  const logout     = useAuthStore((s) => s.logout)
  const isAuth     = useAuthStore((s) => s.isAuthenticated)
  const hasRun     = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    // Single /auth/me call — result sets isInitialized regardless
    initialize()

    // Only log out on session-expired if the user was actually authenticated.
    // This prevents a logout call when the app first loads with no session.
    const handleSessionExpired = () => {
      if (useAuthStore.getState().isAuthenticated) {
        logout()
      }
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
