import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user, userDoc } = useAuth()
  const location = useLocation()

  // Layer 1: must be logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Layer 2: if a specific role is required, check it
  if (requireRole) {
    if (!userDoc || userDoc.role !== requireRole) {
      // Wrong role - silently redirect to their own dashboard
      return <Navigate to="/dashboard" replace />
    }
  }

  // All checks passed
  return children
}

export default ProtectedRoute
