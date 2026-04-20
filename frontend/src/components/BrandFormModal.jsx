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
 * Shared brand editor used by admin (full CRUD) and vendor (own brand).
 * Vendor mode hides is_active + omits the id field.
 */
export default function BrandFormModal({
  initial = {}, token, uploadUrl, mode = 'admin', onClose, onSave,
}) {
  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name ?? '',
    tagline: initial.tagline ?? '',
    bio: initial.bio ?? '',
    category: initial.category ?? '',
    location: initial.location ?? '',
    instagram: initial.instagram ?? '',
    logo_white_url: initial.logo_white_url ?? '',
    logo_navy_url: initial.logo_navy_url ?? '',
    hero_image_url: initial.hero_image_url ?? '',
    card_image_url: initial.card_image_url ?? '',
    is_active: initial.is_active ?? true,
  })
  const [uploadingKey, setUploadingKey] = useState('')
  const [error, setError] = useState('')

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleFile(key, e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingKey(key); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await axios.post(`${API_URL}${uploadUrl}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      set(key, data.image_url)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploadingKey('')
    }
  }

  function imageField(key, label) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-wide uppercase text-muted">{label}</span>
        <div className="flex items-start gap-3">
          {form[key] && <img src={absolutize(form[key])} alt="" className="w-20 h-20 object-contain border border-[#E5E5E5] bg-[#F7F7F7]" />}
          <div className="flex-1 flex flex-col gap-1">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleFile(key, e)} disabled={uploadingKey === key} className="text-xs" />
            <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder="Or paste URL" className="border border-[#E5E5E5] px-3 py-1.5 text-midnight text-xs" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white max-w-2xl w-full p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-midnight font-black uppercase tracking-wide text-lg">
            {mode === 'vendor' ? 'Edit Your Brand' : (form.id ? 'Edit Brand' : 'New Brand')}
          </h3>
          <button onClick={onClose} className="text-muted text-xl hover:text-midnight">×</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Name</span>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Tagline</span>
            <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Category</span>
            <input value={form.category} onChange={(e) => set('category', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-muted">Location</span>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] tracking-wide uppercase text-muted">Instagram</span>
            <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] tracking-wide uppercase text-muted">Bio</span>
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} className="border border-[#E5E5E5] px-3 py-2 text-midnight" />
          </label>

          {imageField('logo_white_url', 'Logo (white)')}
          {imageField('logo_navy_url', 'Logo (navy)')}
          {imageField('hero_image_url', 'Hero image')}
          {imageField('card_image_url', 'Card image')}

          {mode === 'admin' && (
            <label className="flex items-center gap-2 text-[11px] tracking-wide uppercase text-muted md:col-span-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Active (visible on site)
            </label>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="text-[11px] tracking-[0.15em] uppercase font-bold text-muted px-6 py-3 hover:text-midnight">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!!uploadingKey} className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80 disabled:opacity-40">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
