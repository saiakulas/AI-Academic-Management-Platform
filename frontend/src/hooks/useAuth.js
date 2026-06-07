import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'

/**
 * Hook to initialize auth state on app load.
 * Also listens for forced logout events from the API interceptor.
 */
export function useAuthInit() {
  const { initialize, logout, isInitialized } = useAuthStore()

  useEffect(() => {
    initialize()

    const handleForceLogout = () => logout()
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  return { isInitialized }
}
