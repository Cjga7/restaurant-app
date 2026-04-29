import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PrivateRoute({ children, permission }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (permission && !user?.permissions?.includes(permission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}