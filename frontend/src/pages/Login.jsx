import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(next)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-10">

          <div className="w-8 h-px bg-midnight mb-8" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            Account
          </p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-10">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {[
              { name: 'email',    label: 'Email Address', placeholder: 'you@example.com', type: 'email' },
              { name: 'password', label: 'Password',       placeholder: '••••••••',        type: 'password' },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                />
              </div>
            ))}

            {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-muted text-xs text-center mt-8">
            Don&apos;t have an account?{' '}
            <Link to={`/signup?next=${encodeURIComponent(next)}`} className="text-midnight font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
