import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// /signup redirects to /login with CREATE ACCOUNT tab pre-selected
export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next  = searchParams.get('next')  || '/'
  const email = searchParams.get('email') || ''

  useEffect(() => {
    const params = new URLSearchParams({ tab: 'create', next })
    if (email) params.set('email', email)
    navigate(`/login?${params.toString()}`, { replace: true })
  }, [])

  return null
}
