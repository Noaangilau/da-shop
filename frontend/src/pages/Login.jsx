import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputCls = 'border border-rule bg-paper px-4 py-3 text-sm text-ink placeholder-mute/60 focus:outline-none focus:border-ink transition-colors'

// ─── Login + Create Account — tabbed auth card ────────────────────────────────

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next    = searchParams.get('next') || '/'
  const initTab = searchParams.get('tab') === 'create' ? 'create' : 'login'

  const [tab, setTab] = useState(initTab)

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginForm, setLoginForm]     = useState({ email: '', password: '', remember: false })
  const [loginError, setLoginError]   = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  function handleLoginChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setLoginForm({ ...loginForm, [e.target.name]: val })
    setLoginError('')
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) { setLoginError('Please fill in all fields.'); return }
    setLoginLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      navigate(next)
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Create Account form state ─────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    first_name: '', last_name: '', email: searchParams.get('email') || '',
    password: '', phone: '', email_opt_in: false, sms_opt_in: false,
  })
  const [createError, setCreateError]     = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  function handleCreateChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setCreateForm({ ...createForm, [e.target.name]: val })
    setCreateError('')
  }

  async function handleCreateSubmit(e) {
    e.preventDefault()
    if (!createForm.first_name || !createForm.last_name || !createForm.email || !createForm.password) {
      setCreateError('Please fill in all required fields.'); return
    }
    if (createForm.password.length < 8) { setCreateError('Password must be at least 8 characters.'); return }
    setCreateLoading(true)
    try {
      await register(createForm)
      navigate(next)
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white border border-rule">

          {/* Tabs */}
          <div className="flex border-b border-rule">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-4 font-mono text-[11px] tracking-[0.16em] uppercase font-bold transition-colors ${
                tab === 'login'
                  ? 'bg-ink text-paper'
                  : 'bg-white text-mute hover:text-ink'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-4 font-mono text-[11px] tracking-[0.16em] uppercase font-bold transition-colors border-l border-rule ${
                tab === 'create'
                  ? 'bg-ink text-paper'
                  : 'bg-white text-mute hover:text-ink'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* ── Login tab ── */}
          {tab === 'login' && (
            <div className="p-8">
              <p className="font-mono text-mute text-[10px] tracking-[0.3em] uppercase mb-2">WELCOME BACK</p>
              <h1 className="font-display font-black uppercase text-ink text-4xl mb-8 leading-none">SIGN IN.</h1>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="jane@email.com"
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">PASSWORD</label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className={inputCls}
                  />
                </div>

                {/* Remember me + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={loginForm.remember}
                        onChange={handleLoginChange}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 border border-rule peer-checked:bg-ink peer-checked:border-ink transition-colors" />
                      {loginForm.remember && (
                        <svg className="absolute inset-0 w-4 h-4 text-white p-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5 6.5-6" />
                        </svg>
                      )}
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute">REMEMBER ME</span>
                  </label>
                  <button
                    type="button"
                    className="font-mono text-[10px] tracking-[0.1em] uppercase text-mute hover:text-ink transition-colors underline"
                  >
                    FORGOT?
                  </button>
                </div>

                {loginError && <p className="text-red-400 text-xs tracking-wide">{loginError}</p>}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors disabled:opacity-40"
                >
                  {loginLoading ? 'SIGNING IN…' : 'SIGN IN →'}
                </button>
              </form>
            </div>
          )}

          {/* ── Create Account tab ── */}
          {tab === 'create' && (
            <div className="p-8">
              <p className="font-mono text-mute text-[10px] tracking-[0.3em] uppercase mb-2">NEW HERE</p>
              <h1 className="font-display font-black uppercase text-ink text-3xl mb-8 leading-none">CREATE ACCOUNT.</h1>

              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'first_name', label: 'FIRST NAME', placeholder: 'First' },
                    { name: 'last_name',  label: 'LAST NAME',  placeholder: 'Last' },
                  ].map((f) => (
                    <div key={f.name} className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">
                        {f.label} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name={f.name}
                        value={createForm[f.name]}
                        onChange={handleCreateChange}
                        placeholder={f.placeholder}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>

                {[
                  { name: 'email',    label: 'EMAIL',    type: 'email',    placeholder: 'you@example.com',   required: true },
                  { name: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Min. 8 characters', required: true },
                  { name: 'phone',    label: 'PHONE',    type: 'tel',      placeholder: '+64 21 000 0000',   required: false },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">
                      {f.label}{' '}
                      {f.required
                        ? <span className="text-red-400">*</span>
                        : <span className="text-mute font-normal normal-case tracking-normal text-xs">(optional)</span>
                      }
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={createForm[f.name]}
                      onChange={handleCreateChange}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}

                {/* Notification preferences */}
                <div className="border border-rule bg-paper p-4 flex flex-col gap-3">
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">Notifications</p>
                  {[
                    { name: 'email_opt_in', label: 'Email me about new drops and my cart' },
                    { name: 'sms_opt_in',   label: 'Text me order updates and reminders' },
                  ].map((f) => (
                    <label key={f.name} className="flex items-center gap-2.5 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          name={f.name}
                          checked={createForm[f.name]}
                          onChange={handleCreateChange}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 border border-rule peer-checked:bg-ink peer-checked:border-ink transition-colors" />
                        {createForm[f.name] && (
                          <svg className="absolute inset-0 w-4 h-4 text-white p-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5 6.5-6" />
                          </svg>
                        )}
                      </div>
                      <span className="text-mute text-xs">{f.label}</span>
                    </label>
                  ))}
                </div>

                {createError && <p className="text-red-400 text-xs tracking-wide">{createError}</p>}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors disabled:opacity-40"
                >
                  {createLoading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT →'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="font-mono text-mute text-[10px] text-center mt-6 tracking-[0.08em]">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-ink hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-ink hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  )
}
