import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'refunded', 'cancelled']

export default function AdminDashboard() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats]         = useState(null)
  const [orders, setOrders]       = useState([])
  const [inquiries, setInquiries] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts]   = useState([])
  const [brands, setBrands]       = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]     = useState(true)
  const [abandoning, setAbandoning] = useState(false)
  const [abandonResult, setAbandonResult] = useState(null)

  // Product form state
  const [productForm, setProductForm] = useState(null) // null = hidden, {} = new, {...} = edit

  // Announcement form state
  const [annForm, setAnnForm] = useState(null)

  async function loadAll() {
    try {
      const [s, o, i, c, p, b, a] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`,            authHeaders(token)),
        axios.get(`${API_URL}/admin/orders`,           authHeaders(token)),
        axios.get(`${API_URL}/admin/vendor-inquiries`, authHeaders(token)),
        axios.get(`${API_URL}/admin/customers`,        authHeaders(token)),
        axios.get(`${API_URL}/admin/products`,         authHeaders(token)),
        axios.get(`${API_URL}/admin/brands`,           authHeaders(token)),
        axios.get(`${API_URL}/admin/announcements`,    authHeaders(token)),
      ])
      setStats(s.data)
      setOrders(Array.isArray(o.data) ? o.data : [])
      setInquiries(Array.isArray(i.data) ? i.data : [])
      setCustomers(Array.isArray(c.data) ? c.data : [])
      setProducts(Array.isArray(p.data) ? p.data : [])
      setBrands(Array.isArray(b.data) ? b.data : [])
      setAnnouncements(Array.isArray(a.data) ? a.data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [token])

  async function triggerAbandonment() {
    setAbandoning(true); setAbandonResult(null)
    try {
      const { data } = await axios.post(`${API_URL}/admin/trigger-abandonment`, {}, authHeaders(token))
      setAbandonResult(`Sent ${data.notifications_sent} notification${data.notifications_sent !== 1 ? 's' : ''}.`)
    } catch {
      setAbandonResult('Failed to trigger — check logs.')
    } finally {
      setAbandoning(false)
    }
  }

  async function saveProduct(data) {
    const payload = {
      brand_id: Number(data.brand_id),
      name: data.name,
      collection: data.collection || null,
      price: Number(data.price),
      category: data.category || 'Clothing',
      subcategory: data.subcategory || null,
      description: data.description || null,
      sizes: data.sizes ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean) : null,
      image_url: data.image_url || null,
      type: data.type || 'product',
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      stock_count: data.stock_count === '' || data.stock_count == null ? null : Number(data.stock_count),
    }
    try {
      if (data.id) {
        await axios.put(`${API_URL}/admin/products/${data.id}`, payload, authHeaders(token))
      } else {
        await axios.post(`${API_URL}/admin/products`, payload, authHeaders(token))
      }
      setProductForm(null)
      loadAll()
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Permanently delete this product?')) return
    await axios.delete(`${API_URL}/admin/products/${id}`, authHeaders(token))
    loadAll()
  }

  async function toggleActive(id) {
    await axios.patch(`${API_URL}/admin/products/${id}/toggle-active`, {}, authHeaders(token))
    loadAll()
  }

  async function toggleFeatured(id) {
    await axios.patch(`${API_URL}/admin/products/${id}/toggle-featured`, {}, authHeaders(token))
    loadAll()
  }

  async function updateOrderStatus(id, status) {
    await axios.patch(`${API_URL}/admin/orders/${id}/status`, { status }, authHeaders(token))
    loadAll()
  }

  async function saveAnnouncement(data) {
    const payload = {
      title: data.title,
      body: data.body || null,
      cta_label: data.cta_label || null,
      cta_url: data.cta_url || null,
      display_mode: data.display_mode || 'banner',
      is_active: data.is_active ?? true,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
    }
    try {
      if (data.id) {
        await axios.put(`${API_URL}/admin/announcements/${data.id}`, payload, authHeaders(token))
      } else {
        await axios.post(`${API_URL}/admin/announcements`, payload, authHeaders(token))
      }
      setAnnForm(null)
      loadAll()
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  async function deleteAnnouncement(id) {
    if (!confirm('Delete announcement?')) return
    await axios.delete(`${API_URL}/admin/announcements/${id}`, authHeaders(token))
    loadAll()
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
    { id: 'products',   label: `Products (${products.length})` },
    { id: 'orders',     label: `Orders (${orders.length})` },
    { id: 'announcements', label: `Announcements (${announcements.length})` },
    { id: 'inquiries',  label: `Vendors (${inquiries.length})` },
    { id: 'customers',  label: `Customers (${customers.length})` },
  ]

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7]">
      <div className="bg-midnight">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-white/30 mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">Admin</p>
          <h1 className="text-white font-black uppercase" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em' }}>
            Dashboard
          </h1>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
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

            <div className="bg-white border border-[#E5E5E5] p-8 max-w-lg">
              <div className="w-6 h-px bg-midnight mb-5" />
              <h3 className="text-midnight font-black uppercase tracking-wide text-sm mb-2">Cart Abandonment</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Sends notifications to opted-in customers with carts &gt;2 hours old.
              </p>
              <button
                onClick={triggerAbandonment}
                disabled={abandoning}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80 transition-colors disabled:opacity-40"
              >
                {abandoning ? 'Running…' : 'Trigger Notifications'}
              </button>
              {abandonResult && <p className="text-muted text-xs mt-4">{abandonResult}</p>}
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-semibold">
                {products.length} products
              </p>
              <button
                onClick={() => setProductForm({})}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-midnight/80 transition-colors"
              >
                + Add Product
              </button>
            </div>

            <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F7F7] text-muted text-[10px] tracking-[0.15em] uppercase">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Brand</th>
                    <th className="text-left p-3">Collection</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-right p-3">Stock</th>
                    <th className="text-center p-3">Active</th>
                    <th className="text-center p-3">Featured</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-[#E5E5E5]">
                      <td className="p-3 text-midnight font-semibold">{p.name}</td>
                      <td className="p-3 text-muted">{brands.find((b) => b.id === p.brand_id)?.name || p.brand_id}</td>
                      <td className="p-3 text-muted">{p.collection || '—'}</td>
                      <td className="p-3 text-right">${p.price}</td>
                      <td className="p-3 text-right">{p.stock_count ?? '∞'}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleActive(p.id)} className={`text-[10px] tracking-wide uppercase font-bold px-2 py-1 ${p.is_active ? 'bg-midnight text-white' : 'bg-[#F7F7F7] text-muted'}`}>
                          {p.is_active ? 'On' : 'Off'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleFeatured(p.id)} className={`text-[10px] tracking-wide uppercase font-bold px-2 py-1 ${p.is_featured ? 'bg-midnight text-white' : 'bg-[#F7F7F7] text-muted'}`}>
                          {p.is_featured ? '★' : '☆'}
                        </button>
                      </td>
                      <td className="p-3 text-right flex gap-2 justify-end">
                        <button onClick={() => setProductForm({ ...p, sizes: (p.sizes || []).join(', ') })} className="text-[10px] tracking-wide uppercase font-bold text-midnight hover:underline">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="text-[10px] tracking-wide uppercase font-bold text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {productForm && (
              <ProductFormModal
                initial={productForm}
                brands={brands}
                onClose={() => setProductForm(null)}
                onSave={saveProduct}
              />
            )}
          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          orders.length === 0 ? <EmptyState message="No orders yet." /> : (
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
                    <div className="text-right flex flex-col gap-2 items-end">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-[10px] tracking-[0.1em] uppercase font-bold bg-midnight text-white px-3 py-1 border-0"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <p className="text-muted text-xs">{order.shipping_name} · {order.shipping_city}</p>
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

        {/* ── Announcements ── */}
        {activeTab === 'announcements' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-semibold">{announcements.length} announcements</p>
              <button onClick={() => setAnnForm({})} className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-midnight/80 transition-colors">
                + New Announcement
              </button>
            </div>

            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {announcements.length === 0 && <EmptyState message="No announcements yet." />}
              {announcements.map((a) => (
                <div key={a.id} className="bg-white p-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] tracking-wide uppercase font-bold px-2 py-0.5 ${a.is_active ? 'bg-midnight text-white' : 'bg-[#F7F7F7] text-muted'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-muted text-[10px] tracking-wide uppercase">{a.display_mode}</span>
                    </div>
                    <p className="text-midnight font-bold text-sm">{a.title}</p>
                    {a.body && <p className="text-muted text-xs mt-1">{a.body}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAnnForm({ ...a, starts_at: a.starts_at?.slice(0,16), ends_at: a.ends_at?.slice(0,16) })} className="text-[10px] tracking-wide uppercase font-bold text-midnight hover:underline">Edit</button>
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-[10px] tracking-wide uppercase font-bold text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {annForm && (
              <AnnouncementFormModal
                initial={annForm}
                onClose={() => setAnnForm(null)}
                onSave={saveAnnouncement}
              />
            )}
          </div>
        )}

        {/* ── Vendor Inquiries ── */}
        {activeTab === 'inquiries' && (
          inquiries.length === 0 ? <EmptyState message="No vendor applications yet." /> : (
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
          customers.length === 0 ? <EmptyState message="No customers yet." /> : (
            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {customers.map((c) => (
                <div key={c.id} className="bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-midnight font-bold text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-muted text-xs">{c.email}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[10px] tracking-wide uppercase font-medium border border-midnight text-midnight px-2 py-0.5">
                      {c.role || 'customer'}
                    </span>
                    {c.email_opt_in && <span className="text-[10px] tracking-wide uppercase font-medium border border-midnight text-midnight px-2 py-0.5">Email</span>}
                    {c.sms_opt_in && <span className="text-[10px] tracking-wide uppercase font-medium border border-midnight text-midnight px-2 py-0.5">SMS</span>}
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

function ProductFormModal({ initial, brands, onClose, onSave }) {
  const [form, setForm] = useState({
    id: initial.id,
    brand_id: initial.brand_id ?? (brands[0]?.id ?? ''),
    name: initial.name ?? '',
    collection: initial.collection ?? '',
    price: initial.price ?? '',
    category: initial.category ?? 'Clothing',
    subcategory: initial.subcategory ?? '',
    description: initial.description ?? '',
    sizes: initial.sizes ?? '',
    image_url: initial.image_url ?? '',
    type: initial.type ?? 'product',
    is_active: initial.is_active ?? true,
    is_featured: initial.is_featured ?? false,
    stock_count: initial.stock_count ?? '',
  })
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white max-w-2xl w-full p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-midnight font-black uppercase tracking-wide text-lg">
            {form.id ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} className="text-muted text-xl hover:text-midnight">×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Brand</span>
            <select value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight">
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Name</span>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Collection</span>
            <input value={form.collection} onChange={(e) => set('collection', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Price (USD)</span>
            <input type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Category</span>
            <input value={form.category} onChange={(e) => set('category', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Subcategory</span>
            <input value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Sizes (comma-separated)</span>
            <input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S, M, L, XL" className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Stock (blank = untracked)</span>
            <input type="number" value={form.stock_count} onChange={(e) => set('stock_count', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] tracking-wide uppercase text-muted">Image URL (leave blank for Coming Soon)</span>
            <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] tracking-wide uppercase text-muted">Description</span>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Type</span>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight">
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </label>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-[11px] tracking-wide uppercase text-muted">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Active
            </label>
            <label className="flex items-center gap-2 text-[11px] tracking-wide uppercase text-muted">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="text-[11px] tracking-[0.15em] uppercase font-bold text-muted px-6 py-3 hover:text-midnight">Cancel</button>
          <button onClick={() => onSave(form)} className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function AnnouncementFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    id: initial.id,
    title: initial.title ?? '',
    body: initial.body ?? '',
    cta_label: initial.cta_label ?? '',
    cta_url: initial.cta_url ?? '',
    display_mode: initial.display_mode ?? 'banner',
    is_active: initial.is_active ?? true,
    starts_at: initial.starts_at ?? '',
    ends_at: initial.ends_at ?? '',
  })
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white max-w-xl w-full p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-midnight font-black uppercase tracking-wide text-lg">
            {form.id ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <button onClick={onClose} className="text-muted text-xl hover:text-midnight">×</button>
        </div>
        <div className="flex flex-col gap-4 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Title</span>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Body (for popup)</span>
            <textarea value={form.body} onChange={(e) => set('body', e.target.value)} rows={3} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wide uppercase text-muted">CTA Label</span>
              <input value={form.cta_label} onChange={(e) => set('cta_label', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wide uppercase text-muted">CTA URL</span>
              <input value={form.cta_url} onChange={(e) => set('cta_url', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Display Mode</span>
            <select value={form.display_mode} onChange={(e) => set('display_mode', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight">
              <option value="banner">Banner (top strip)</option>
              <option value="popup">Popup (once per visitor)</option>
              <option value="both">Both</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wide uppercase text-muted">Starts (optional)</span>
              <input type="datetime-local" value={form.starts_at || ''} onChange={(e) => set('starts_at', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wide uppercase text-muted">Ends (optional)</span>
              <input type="datetime-local" value={form.ends_at || ''} onChange={(e) => set('ends_at', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-[11px] tracking-wide uppercase text-muted">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Active
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="text-[11px] tracking-[0.15em] uppercase font-bold text-muted px-6 py-3 hover:text-midnight">Cancel</button>
          <button onClick={() => onSave(form)} className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
