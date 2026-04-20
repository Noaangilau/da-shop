import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function absolutize(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/media/')) return `${API_URL}${url}`
  return url
}

/**
 * Shared product form modal used by both admin and vendor dashboards.
 * Props:
 *   - initial: {} for new, or existing product for edit
 *   - brands: brand list (only used in admin mode; hidden in vendor mode)
 *   - token: JWT for uploads
 *   - uploadUrl: e.g. `/admin/upload-image` or `/vendor/upload-image`
 *   - mode: 'admin' | 'vendor'  — vendor hides brand select + is_featured
 *   - onClose, onSave
 */
export default function ProductFormModal({
  initial, brands = [], token, uploadUrl, mode = 'admin', onClose, onSave,
}) {
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await axios.post(`${API_URL}${uploadUrl}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      set('image_url', data.image_url)
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const showBrand = mode === 'admin'
  const showFeatured = mode === 'admin'

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
          {showBrand && (
            <label className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wide uppercase text-muted">Brand</span>
              <select value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight">
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          )}
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

          <div className="md:col-span-2 flex flex-col gap-2">
            <span className="text-[10px] tracking-wide uppercase text-muted">Product Image</span>
            <div className="flex items-start gap-4">
              {form.image_url && (
                <img src={absolutize(form.image_url)} alt="" className="w-28 h-auto border border-[#E5E5E5] object-cover" />
              )}
              <div className="flex-1 flex flex-col gap-2">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} className="text-xs" />
                {uploading && <p className="text-muted text-xs">Uploading…</p>}
                {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
                <input
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="Or paste an image URL"
                  className="border border-[#E5E5E5] px-3 py-2 text-midnight text-sm"
                />
              </div>
            </div>
          </div>

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
            {showFeatured && (
              <label className="flex items-center gap-2 text-[11px] tracking-wide uppercase text-muted">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured
              </label>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="text-[11px] tracking-[0.15em] uppercase font-bold text-muted px-6 py-3 hover:text-midnight">Cancel</button>
          <button onClick={() => onSave(form)} disabled={uploading} className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80 disabled:opacity-40">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
