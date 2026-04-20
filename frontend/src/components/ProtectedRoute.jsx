import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, vendorOnly = false }) {
  const { customer, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!customer) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (adminOnly && !customer.is_admin) {
    return <Navigate to="/" replace />
  }

  if (vendorOnly && (customer.role !== 'vendor' || !customer.brand_id)) {
    return <Navigate to="/" replace />
  }

  return children
}
