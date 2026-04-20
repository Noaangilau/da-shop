import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ProductFormModal from '../components/ProductFormModal'
import BrandFormModal from '../components/BrandFormModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

function absolutize(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/media/')) return `${API_URL}${url}`
  return url
}

export default function VendorDashboard() {
  const { token, customer } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [brand, setBrand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [productForm, setProductForm] = useState(null)
  const [brandForm, setBrandForm] = useState(null)

  async function loadAll() {
    try {
      const [p, b] = await Promise.all([
        axios.get(`${API_URL}/vendor/products`, authHeaders(token)),
        axios.get(`${API_URL}/vendor/brand`, authHeaders(token)),
      ])
      setProducts(Array.isArray(p.data) ? p.data : [])
      setBrand(b.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [token])

  async function saveProduct(data) {
    const payload = {
      name: data.name,
      collection: data.collection || null,
      price: Number(data.price),
      category: data.category || 'Clothing',
      subcategory: data.subcategory || null,
      description: data.description || null,
      sizes: data.sizes ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean) : null,
      variants: Array.isArray(data.variants) && data.variants.length > 0
        ? data.variants.filter((v) => v.color && v.image_url)
        : null,
      image_url: data.image_url || null,
      type: data.type || 'product',
      is_active: data.is_active ?? true,
      stock_count: data.stock_count === '' || data.stock_count == null ? null : Number(data.stock_count),
    }
    try {
      if (data.id) {
        await axios.put(`${API_URL}/vendor/products/${data.id}`, payload, authHeaders(token))
      } else {
        await axios.post(`${API_URL}/vendor/products`, payload, authHeaders(token))
      }
      setProductForm(null)
      loadAll()
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Permanently delete this product?')) return
    await axios.delete(`${API_URL}/vendor/products/${id}`, authHeaders(token))
    loadAll()
  }

  async function saveBrand(data) {
    try {
      await axios.put(`${API_URL}/vendor/brand`, data, authHeaders(token))
      setBrandForm(null)
      loadAll()
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  if (loading) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const pending = brand && !brand.is_active
  const tabs = [
    { id: 'products', label: `Products (${products.length})` },
    { id: 'brand',    label: 'Brand' },
  ]

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7]">
      <div className="bg-midnight">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-white/30 mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">Vendor</p>
          <h1 className="text-white font-black uppercase" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em' }}>
            {brand?.name || customer?.first_name}
          </h1>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {pending && (
          <div className="bg-white border border-midnight p-6 mb-8">
            <p className="text-midnight font-black text-[11px] tracking-[0.15em] uppercase mb-2">Awaiting Approval</p>
            <p className="text-muted text-sm">
              Your brand is pending admin approval. You can add products now — they'll go live as soon as your brand is activated.
            </p>
          </div>
        )}

        {tab === 'products' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-semibold">{products.length} products</p>
              <button
                onClick={() => setProductForm({})}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-midnight/80"
              >
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white py-24 text-center">
                <p className="text-muted text-sm uppercase tracking-widest">No products yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F7F7] text-muted text-[10px] tracking-[0.15em] uppercase">
                    <tr>
                      <th className="text-left p-3">Image</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Collection</th>
                      <th className="text-right p-3">Price</th>
                      <th className="text-right p-3">Stock</th>
                      <th className="text-center p-3">Active</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-[#E5E5E5]">
                        <td className="p-3">
                          {p.image_url && <img src={absolutize(p.image_url)} alt="" className="w-12 h-12 object-cover border border-[#E5E5E5]" />}
                        </td>
                        <td className="p-3 text-midnight font-semibold">{p.name}</td>
                        <td className="p-3 text-muted">{p.collection || '—'}</td>
                        <td className="p-3 text-right">${p.price}</td>
                        <td className="p-3 text-right">{p.stock_count ?? '∞'}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] tracking-wide uppercase font-bold px-2 py-1 ${p.is_active ? 'bg-midnight text-white' : 'bg-[#F7F7F7] text-muted'}`}>
                            {p.is_active ? 'On' : 'Off'}
                          </span>
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
            )}

            {productForm && (
              <ProductFormModal
                initial={productForm}
                token={token}
                uploadUrl="/vendor/upload-image"
                mode="vendor"
                onClose={() => setProductForm(null)}
                onSave={saveProduct}
              />
            )}
          </div>
        )}

        {tab === 'brand' && brand && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase font-semibold">Your Brand Page</p>
              <button
                onClick={() => setBrandForm(brand)}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-midnight/80"
              >
                Edit Brand
              </button>
            </div>
            <div className="bg-white border border-[#E5E5E5] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Name</p>
                <p className="text-midnight font-bold">{brand.name}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Tagline</p>
                <p className="text-midnight">{brand.tagline || '—'}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Category</p>
                <p className="text-midnight">{brand.category || '—'}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Location</p>
                <p className="text-midnight">{brand.location || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted text-[10px] tracking-wide uppercase mb-1">Bio</p>
                <p className="text-midnight leading-relaxed whitespace-pre-wrap">{brand.bio || '—'}</p>
              </div>
            </div>

            {brandForm && (
              <BrandFormModal
                initial={brandForm}
                token={token}
                uploadUrl="/vendor/upload-image"
                mode="vendor"
                onClose={() => setBrandForm(null)}
                onSave={saveBrand}
              />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
