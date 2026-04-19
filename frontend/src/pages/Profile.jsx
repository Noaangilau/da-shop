import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Profile() {
  const { customer, token, updateProfile, logout } = useAuth()

  const [form, setForm] = useState({
    first_name:   customer?.first_name || '',
    last_name:    customer?.last_name  || '',
    phone:        customer?.phone      || '',
    email_opt_in: customer?.email_opt_in ?? false,
    sms_opt_in:   customer?.sms_opt_in  ?? false,
  })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [orders, setOrders]     = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    axios
      .get(`${API_URL}/customers/me/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [token])

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
    setSaved(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-midnight mb-8" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            My Account
          </p>
          <h1
            className="text-midnight font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em' }}
          >
            {customer?.first_name} {customer?.last_name}
          </h1>
          <p className="text-muted text-sm mt-2">{customer?.email}</p>
        </div>

        {/* Tabs */}
        <div className="max-w-[1280px] mx-auto px-6 flex gap-0">
          {[
            { id: 'profile', label: 'Profile & Preferences' },
            { id: 'orders',  label: `Orders (${orders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-midnight text-midnight'
                  : 'border-transparent text-muted hover:text-midnight'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-16">

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <form onSubmit={handleSave} className="flex flex-col gap-5">

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'first_name', label: 'First Name' },
                  { name: 'last_name',  label: 'Last Name'  },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">{f.label}</label>
                    <input
                      type="text"
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                  Phone <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+64 21 000 0000"
                  className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                />
              </div>

              {/* Notification preferences */}
              <div className="border border-[#E5E5E5] bg-white p-6 flex flex-col gap-4">
                <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-black">
                  Notification Preferences
                </p>
                {[
                  { name: 'email_opt_in', label: 'Email me about new drops and cart reminders' },
                  { name: 'sms_opt_in',   label: 'Text me order updates and reminders' },
                ].map((f) => (
                  <label key={f.name} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" name={f.name} checked={form[f.name]} onChange={handleChange} className="sr-only peer" />
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
                {form.sms_opt_in && !form.phone && (
                  <p className="text-amber-500 text-[10px] tracking-wide">
                    Add a phone number above to receive SMS notifications.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saved && (
                  <span className="text-muted text-xs tracking-wide">Saved.</span>
                )}
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-[#E5E5E5]">
              <button
                onClick={logout}
                className="text-muted text-[11px] tracking-[0.15em] uppercase font-medium hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-24 text-center bg-white max-w-sm mx-auto">
                <div className="w-8 h-px bg-midnight mx-auto mb-8" />
                <p className="text-muted text-sm uppercase tracking-widest mb-6">No orders yet.</p>
                <Link
                  to="/"
                  className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-px bg-[#E5E5E5]">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-muted text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                          Order #{order.id}
                        </p>
                        <p className="text-midnight font-black text-lg">${Number(order.total ?? 0).toFixed(2)}</p>
                      </div>
                      <span className="text-[10px] tracking-[0.15em] uppercase font-bold bg-midnight text-white px-3 py-1">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mb-3">
                      {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                        <p key={i} className="text-gray-500 text-xs">
                          {item.product_name} <span className="text-muted">×{item.quantity}</span>
                        </p>
                      ))}
                    </div>
                    <p className="text-muted text-[10px] tracking-wide">
                      {new Date(order.created_at).toLocaleDateString('en-NZ', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
