import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export default function AdminDashboard() {
  const { token, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats]         = useState(null)
  const [orders, setOrders]       = useState([])
  const [inquiries, setInquiries] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [abandoning, setAbandoning] = useState(false)
  const [abandonResult, setAbandonResult] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/admin/stats`,            authHeaders(token)),
      axios.get(`${API_URL}/admin/orders`,           authHeaders(token)),
      axios.get(`${API_URL}/admin/vendor-inquiries`, authHeaders(token)),
      axios.get(`${API_URL}/admin/customers`,        authHeaders(token)),
    ])
      .then(([s, o, i, c]) => {
        setStats(s.data)
        setOrders(Array.isArray(o.data) ? o.data : [])
        setInquiries(Array.isArray(i.data) ? i.data : [])
        setCustomers(Array.isArray(c.data) ? c.data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function triggerAbandonment() {
    setAbandoning(true)
    setAbandonResult(null)
    try {
      const { data } = await axios.post(`${API_URL}/admin/trigger-abandonment`, {}, authHeaders(token))
      setAbandonResult(`Sent ${data.notifications_sent} notification${data.notifications_sent !== 1 ? 's' : ''}.`)
    } catch {
      setAbandonResult('Failed to trigger — check logs.')
    } finally {
      setAbandoning(false)
    }
  }

  if (loading) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const tabs = [
    { id: 'overview',   label: 'Overview' },
    { id: 'orders',     label: `Orders (${orders.length})` },
    { id: 'inquiries',  label: `Vendors (${inquiries.length})` },
    { id: 'customers',  label: `Customers (${customers.length})` },
  ]

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7]">

      {/* Header */}
      <div className="bg-midnight">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-white/30 mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            Admin
          </p>
          <h1
            className="text-white font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em' }}
          >
            Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="max-w-[1280px] mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">

        {/* ── Overview ── */}
        {activeTab === 'overview' && stats && (
          <div className="flex flex-col gap-10">

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {[
                { label: 'Total Orders',    value: stats.total_orders ?? 0 },
                { label: 'Revenue',         value: `$${Number(stats.total_revenue ?? 0).toFixed(2)}` },
                { label: 'Customers',       value: stats.total_customers ?? 0 },
                { label: 'Vendor Inquiries', value: stats.total_inquiries ?? 0 },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white p-8">
                  <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-semibold mb-3">{kpi.label}</p>
                  <p className="text-midnight font-black text-3xl">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Cart abandonment trigger */}
            <div className="bg-white border border-[#E5E5E5] p-8 max-w-lg">
              <div className="w-6 h-px bg-midnight mb-5" />
              <h3 className="text-midnight font-black uppercase tracking-wide text-sm mb-2">
                Cart Abandonment
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Sends email + SMS notifications to opted-in customers who have had items in their cart for over 2 hours without checking out.
              </p>
              <button
                onClick={triggerAbandonment}
                disabled={abandoning}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80 transition-colors disabled:opacity-40"
              >
                {abandoning ? 'Running…' : 'Trigger Notifications'}
              </button>
              {abandonResult && (
                <p className="text-muted text-xs mt-4">{abandonResult}</p>
              )}
            </div>

          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <EmptyState message="No orders yet." />
          ) : (
            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-muted text-[10px] tracking-[0.15em] uppercase font-medium">
                        Order #{order.id} · {new Date(order.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-midnight font-black text-lg mt-1">${Number(order.total ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] tracking-[0.15em] uppercase font-bold bg-midnight text-white px-3 py-1">
                        {order.status}
                      </span>
                      <p className="text-muted text-xs mt-2">{order.shipping_name} · {order.shipping_city}</p>
                      <p className="text-muted text-[10px]">{order.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                      <p key={i} className="text-gray-500 text-xs">
                        <span className="text-muted">{item.brand}</span> — {item.product_name} ×{item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Vendor Inquiries ── */}
        {activeTab === 'inquiries' && (
          inquiries.length === 0 ? (
            <EmptyState message="No vendor applications yet." />
          ) : (
            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Business</p>
                    <p className="text-midnight font-bold text-sm">{inq.business_name}</p>
                  </div>
                  <div>
                    <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Contact</p>
                    <p className="text-midnight text-sm">{inq.contact_name}</p>
                    <p className="text-muted text-xs">{inq.email}</p>
                  </div>
                  <div>
                    <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Category</p>
                    <p className="text-midnight text-sm">{inq.product_category}</p>
                  </div>
                  <div>
                    <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Instagram</p>
                    <p className="text-midnight text-sm">{inq.instagram_handle || '—'}</p>
                    <p className="text-muted text-[10px] mt-1">
                      {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Customers ── */}
        {activeTab === 'customers' && (
          customers.length === 0 ? (
            <EmptyState message="No customers yet." />
          ) : (
            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {customers.map((c) => (
                <div key={c.id} className="bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-midnight font-bold text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-muted text-xs">{c.email}</p>
                  </div>
                  <div className="flex gap-3">
                    {c.email_opt_in && (
                      <span className="text-[10px] tracking-wide uppercase font-medium border border-midnight text-midnight px-2 py-0.5">
                        Email
                      </span>
                    )}
                    {c.sms_opt_in && (
                      <span className="text-[10px] tracking-wide uppercase font-medium border border-midnight text-midnight px-2 py-0.5">
                        SMS
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-[10px]">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </main>
  )
}

function EmptyState({ message }) {
  return (
    <div className="py-24 text-center bg-white">
      <div className="w-8 h-px bg-midnight mx-auto mb-8" />
      <p className="text-muted text-sm uppercase tracking-widest">{message}</p>
    </div>
  )
}
