import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORIES = [
  'Clothing',
  'Jewelry',
  'Paintings & Prints',
  'Art Services / Commissions',
  'Mixed / Multiple Categories',
]

export default function BecomeAVendor() {
  const navigate = useNavigate()
  const { customer } = useAuth()

  const [form, setForm] = useState({
    email: '', password: '',
    first_name: '', last_name: '', phone: '',
    brand_name: '', tagline: '', category: '',
    location: '', instagram: '', bio: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const required = ['email', 'password', 'first_name', 'last_name', 'brand_name', 'category']
    if (required.some((f) => !form[f])) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/auth/register-vendor`, form)
      localStorage.setItem('da_shop_token', data.token)
      setSubmitted(true)
      setTimeout(() => navigate('/vendor'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (customer?.role === 'vendor') {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-10 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-4">You're Already a Vendor</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">Go to your vendor dashboard to manage your products.</p>
          <Link to="/vendor" className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-10 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-4">Account Created</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Your vendor account is ready. Your storefront is pending admin approval — in the meantime you can start adding products.
          </p>
          <p className="text-muted text-xs">Redirecting to your dashboard…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[88px]">

      <section
        className="relative py-32 px-6 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=70')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-medium mb-6">Join the Marketplace</p>
          <h1 className="text-white font-black uppercase leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em' }}>
            Become a Vendor
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
            Create your account, set up your brand page, and start adding products today. We review and activate new storefronts within 3–5 days.
          </p>
        </div>
      </section>

      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">Vendor Sign-up</p>
            <h2 className="text-midnight font-black uppercase tracking-wide text-3xl">Create Your Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold border-b border-[#E5E5E5] pb-2">You</p>
            {renderField('first_name', 'First Name', form, handleChange, true)}
            {renderField('last_name', 'Last Name', form, handleChange, true)}
            {renderField('email', 'Email', form, handleChange, true, 'email')}
            {renderField('password', 'Password', form, handleChange, true, 'password')}
            {renderField('phone', 'Phone', form, handleChange, false, 'tel')}

            <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold border-b border-[#E5E5E5] pb-2 mt-4">Your Brand</p>
            {renderField('brand_name', 'Brand Name', form, handleChange, true)}
            {renderField('tagline', 'Tagline', form, handleChange, false)}

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category" value={form.category} onChange={handleChange}
                className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight bg-white focus:outline-none focus:border-midnight"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {renderField('location', 'Location', form, handleChange, false)}
            {renderField('instagram', 'Instagram', form, handleChange, false)}

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                Short Bio <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
              </label>
              <textarea
                name="bio" value={form.bio} onChange={handleChange} rows={3}
                className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight bg-white focus:outline-none focus:border-midnight"
              />
            </div>

            {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'Creating…' : 'Create Vendor Account'}
            </button>
            <p className="text-muted text-xs leading-relaxed text-center">
              Already have an account? <Link to="/login" className="underline hover:text-midnight">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

function renderField(name, label, form, onChange, required, type = 'text') {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
        {label}{' '}
        {required
          ? <span className="text-red-400">*</span>
          : <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>}
      </label>
      <input
        type={type} name={name} value={form[name]} onChange={onChange}
        className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight bg-white focus:outline-none focus:border-midnight"
      />
    </div>
  )
}
