import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Not logged in - redirect to login, remembering where they were going
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Logged in - show the protected content
  return children
}

export default ProtectedRoute