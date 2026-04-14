import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORIES = [
  'Clothing',
  'Jewelry',
  'Food + Goods',
  'Art + Ink',
  'Accessories',
  'Health + Beauty',
  'Home + Living',
  'Other',
]

// ─── Become a Vendor Page ─────────────────────────────────────────────────────

export default function BecomeAVendor() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    instagram_handle: '',
    product_category: '',
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
    if (!form.business_name || !form.contact_name || !form.email || !form.product_category) {
      setError('Please fill in all required fields.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/vendor-inquiry`, form)
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="pt-16 min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight text-3xl font-black uppercase tracking-wide mb-4">
            Application Received
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            Thanks for applying to sell on DA SHOP. We'll review your application and get back to you within 3–5 business days.
          </p>
          <Link
            to="/"
            className="inline-block bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16">

      {/* ── Hero ── */}
      <section
        className="relative py-28 px-6 flex items-center justify-center text-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=70')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase font-medium mb-5">
            Join the Marketplace
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-wide leading-tight mb-5">
            Become a Vendor
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto">
            DA SHOP is built for Pacific vendors. Get your own storefront, reach new customers, and represent your culture on your terms.
          </p>
        </div>
      </section>

      {/* ── Why DA SHOP ── */}
      <section className="bg-sand py-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
          {[
            { title: 'Your Own Storefront', body: 'A dedicated page for your brand, your products, and your story — no noise from other vendors.' },
            { title: 'Built for the Culture', body: 'A marketplace made specifically for Pacific vendors. Your buyers already know what they are looking for.' },
            { title: 'Simple Setup', body: 'No tech skills needed. Apply below, we handle the rest and get you live within the week.' },
          ].map((item) => (
            <div key={item.title} className="bg-white p-8">
              <div className="w-8 h-px bg-midnight mb-6" />
              <h3 className="text-midnight font-black uppercase tracking-wide text-xs mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Form ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-lg mx-auto">
          <div className="mb-12">
            <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-3">
              Step 1 of 1
            </p>
            <h2 className="text-midnight text-3xl font-black uppercase tracking-wide">
              Apply Now
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-xs tracking-widest uppercase font-semibold">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                placeholder="Frost City Tatau"
                className="border border-gray-200 px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-xs tracking-widest uppercase font-semibold">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="Full name"
                className="border border-gray-200 px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-xs tracking-widest uppercase font-semibold">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="border border-gray-200 px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-xs tracking-widest uppercase font-semibold">
                Instagram Handle{' '}
                <span className="text-muted font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="instagram_handle"
                value={form.instagram_handle}
                onChange={handleChange}
                placeholder="@yourhandle"
                className="border border-gray-200 px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-xs tracking-widest uppercase font-semibold">
                Product Category <span className="text-red-400">*</span>
              </label>
              <select
                name="product_category"
                value={form.product_category}
                onChange={handleChange}
                className="border border-gray-200 px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-red-400 text-xs tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>

            <p className="text-muted text-xs leading-relaxed text-center">
              We review every application personally. You'll hear back within 3–5 business days.
            </p>

          </form>
        </div>
      </section>

    </main>
  )
}
