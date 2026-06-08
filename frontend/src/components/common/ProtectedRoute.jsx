import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { FullPageSpinner } from '@/components/ui/Spinner'

/**
 * Protects routes behind authentication.
 *
 * Waits for isInitialized before making any redirect decision.
 * This prevents a flash-redirect to /login while the initial /auth/me
 * is still in-flight.
 */
export default function ProtectedRoute({ children, roles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized   = useAuthStore((s) => s.isInitialized)
  const user            = useAuthStore((s) => s.user)
  const location        = useLocation()

  // Still verifying session — show spinner, make no decisions yet
  if (!isInitialized) {
    return <FullPageSpinner />
  }

  // Session verified, not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Role-based access control — redirect to dashboard root if wrong role
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * Blocks authenticated users from visiting auth pages (login/register).
 * Also waits for initialization before deciding.
 */
export function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized   = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) {
    return <FullPageSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
