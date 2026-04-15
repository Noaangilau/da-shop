import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Updated categories — no food or beverage
const CATEGORIES = [
  'Clothing',
  'Jewelry',
  'Paintings & Prints',
  'Art Services / Commissions',
  'Mixed / Multiple Categories',
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-10 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-4">
            Application Received
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            Thanks for applying to sell on DA SHOP. We'll review your application and be in touch within 3–5 business days.
          </p>
          <Link
            to="/"
            className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[88px]">

      {/* ── Hero ── */}
      <section
        className="relative py-32 px-6 flex items-center justify-center text-center overflow-hidden"
        style={{
          // Artisan/textile workshop — not hotel-like
          backgroundImage: `url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=70')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-medium mb-6">
            Join the Marketplace
          </p>
          <h1
            className="text-white font-black uppercase leading-tight mb-5"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em' }}
          >
            Become a Vendor
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
            DA SHOP is built for Pacific vendors. Get your own branded storefront, reach new customers, and represent your culture on your terms.
          </p>
        </div>
      </section>

      {/* ── Why DA SHOP ── */}
      <section className="bg-white py-16 px-6 border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E5E5]">
            {[
              {
                title: 'Your Own Storefront',
                body: 'A branded page for your business, your products, and your story — no noise from other vendors.',
              },
              {
                title: 'Built for the Culture',
                body: 'A marketplace made specifically for Pacific vendors. Your buyers already know what they are looking for.',
              },
              {
                title: 'Simple Setup',
                body: 'No tech skills needed. Apply below, we handle the rest and get you live within the week.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8">
                <div className="w-6 h-px bg-midnight mb-6" />
                <h3 className="text-midnight font-black uppercase tracking-wide text-xs mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application form ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-lg mx-auto">
          <div className="mb-12">
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
              Step 1 of 1
            </p>
            <h2 className="text-midnight font-black uppercase tracking-wide text-3xl">
              Apply Now
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {[
              { name: 'business_name', label: 'Business Name', placeholder: 'Your brand name', required: true },
              { name: 'contact_name', label: 'Your Name', placeholder: 'Full name', required: true },
              { name: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
              { name: 'instagram_handle', label: 'Instagram Handle', placeholder: '@yourhandle', required: false },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                  {field.label}{' '}
                  {field.required
                    ? <span className="text-red-400">*</span>
                    : <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
                  }
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                Product Category <span className="text-red-400">*</span>
              </label>
              <select
                name="product_category"
                value={form.product_category}
                onChange={handleChange}
                className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white appearance-none cursor-pointer"
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
              className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
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
