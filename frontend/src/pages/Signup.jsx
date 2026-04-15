import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    email_opt_in: false,
    sms_opt_in: false,
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate(next)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white p-10">

          <div className="w-8 h-px bg-midnight mb-8" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            Account
          </p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-10">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'first_name', label: 'First Name', placeholder: 'First' },
                { name: 'last_name',  label: 'Last Name',  placeholder: 'Last' },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                    {f.label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                  />
                </div>
              ))}
            </div>

            {[
              { name: 'email',    label: 'Email Address', placeholder: 'you@example.com', type: 'email',    required: true },
              { name: 'password', label: 'Password',       placeholder: 'Min. 8 characters', type: 'password', required: true },
              { name: 'phone',    label: 'Phone Number',   placeholder: '+64 21 000 0000',   type: 'tel',      required: false },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                  {f.label}{' '}
                  {f.required
                    ? <span className="text-red-400">*</span>
                    : <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
                  }
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

            {/* Notification preferences */}
            <div className="border border-[#E5E5E5] p-5 flex flex-col gap-3">
              <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
                Notification Preferences
              </p>
              {[
                { name: 'email_opt_in', label: 'Email me about new drops and my cart' },
                { name: 'sms_opt_in',   label: 'Text me order updates and reminders' },
              ].map((f) => (
                <label key={f.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      name={f.name}
                      checked={form[f.name]}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 border border-[#E5E5E5] peer-checked:bg-midnight peer-checked:border-midnight transition-colors" />
                    {form[f.name] && (
                      <svg className="absolute inset-0 w-4 h-4 text-white p-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5 6.5-6" />
                      </svg>
                    )}
                  </div>
                  <span className="text-muted text-xs group-hover:text-midnight transition-colors">{f.label}</span>
                </label>
              ))}
              <p className="text-muted text-[10px] leading-relaxed mt-1">
                You can change these at any time from your profile. We never share your details.
              </p>
            </div>

            {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-muted text-xs text-center mt-8">
            Already have an account?{' '}
            <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-midnight font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
