import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { FullPageSpinner } from '@/components/ui/Spinner'

/**
 * Protects routes behind authentication.
 * Redirects to login with the attempted URL preserved.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Role-based access control
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * Redirects authenticated users away from auth pages
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return <FullPageSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
