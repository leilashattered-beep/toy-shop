import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) return <Loader text="Проверяем доступ…" />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/account" replace />
  }

  return children
}
