import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import SizeGuideModal from '../components/SizeGuideModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Derive a human-readable shirt-type label from product fields
function getTypeLabel(product) {
  const name = product.name?.toLowerCase() || ''
  const col  = product.collection?.toLowerCase() || ''
  if (name.includes('long sleeve') || col.includes('long sleeve')) return 'Long Sleeve'
  if (name.includes('hoodie') || col.includes('hoodie'))             return 'Hoodie'
  if (name.includes('crewneck') || col.includes('crewneck'))         return 'Crewneck'
  if (product.category === 'Clothing')                               return 'Tee'
  return null
}

function RelatedProductCard({ product }) {
  const categorySlug =
    product.category === 'Paintings'    ? 'paintings'
    : product.category === 'Art Services' ? 'art-services'
    : (product.category || '').toLowerCase()

  return (
    <Link to={`/product/${product.id}`} className="group bg-white">
      <div className="relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full aspect-[4/5] bg-ink/5 flex items-center justify-center">
            <p className="text-mute text-[10px] tracking-[0.3em] uppercase font-semibold">
              Coming Soon
            </p>
          </div>
        )}
        {product.collection && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-ink text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
              {product.collection}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-rule">
        <p className="text-mute text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
          {product.collection}
        </p>
        <h3 className="text-ink font-bold text-[13px] mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <span className="text-ink font-bold text-[13px]">${product.price}</span>
      </div>
    </Link>
  )
}

// ─── Product Detail Page — /product/:id ──────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart, openDrawer } = useCart()

  const [product, setProduct]   = useState(null)
  const [brand, setBrand]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError]       = useState(false)

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [sizeError, setSizeError]       = useState(false)
  const [added, setAdded]               = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const sizeRef = useRef(null)

  const [related, setRelated]         = useState([])
  const [relatedLoading, setRelLoading] = useState(false)

  // Inquiry form state (Art Services only)
  const [inquiry, setInquiry]             = useState({ name: '', email: '', description: '', size: '', timeline: '', budget: '' })
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setError(false)
    setSelectedSize(null)
    setSelectedVariant(null)
    setSizeError(false)
    setAdded(false)
    setRelated([])
    setBrand(null)

    axios.get(`${API_URL}/products/${id}`)
      .then((res) => {
        setProduct(res.data)
        const variants = Array.isArray(res.data.variants) ? res.data.variants : null
        if (variants && variants.length > 0) setSelectedVariant(variants[0])
        axios.get(`${API_URL}/brands/${res.data.brand_id}`).then(r => setBrand(r.data)).catch(() => {})
        // Fetch related products from same collection
        if (res.data.collection) {
          setRelLoading(true)
          axios.get(`${API_URL}/products`, {
            params: { category: res.data.category, brand_id: res.data.brand_id },
          })
            .then((r) => {
              const items = Array.isArray(r.data) ? r.data : []
              setRelated(
                items
                  .filter((p) => p.id !== res.data.id && p.collection === res.data.collection)
                  .slice(0, 4)
              )
            })
            .catch(() => {})
            .finally(() => setRelLoading(false))
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
        else setError(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="aspect-square bg-ink/10 animate-pulse" />
            <div className="flex flex-col gap-5 pt-4">
              <div className="h-3 w-32 bg-ink/10 animate-pulse" />
              <div className="h-10 w-3/4 bg-ink/10 animate-pulse" />
              <div className="h-6 w-20 bg-ink/10 animate-pulse" />
              <div className="h-px w-full bg-rule" />
              <div className="h-3 w-full bg-ink/10 animate-pulse" />
              <div className="h-3 w-5/6 bg-ink/10 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || (!loading && !product)) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-mute text-[10px] tracking-[0.4em] uppercase mb-4">404</p>
          <h1 className="text-ink font-black uppercase tracking-wide text-3xl mb-6">
            Product Not Found
          </h1>
          <Link to="/" className="bg-ink text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 inline-block hover:bg-ink/80 transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-mute text-sm uppercase tracking-widest">
            Something went wrong. Try refreshing.
          </p>
        </div>
      </main>
    )
  }

  const isService      = product.type === 'service'
  const typeLabel      = getTypeLabel(product)
  const categoryDisplay = product.category === 'Paintings' ? 'Paintings & Prints' : product.category
  const categorySlug =
    product.category === 'Paintings'    ? 'paintings'
    : product.category === 'Art Services' ? 'art-services'
    : (product.category || '').toLowerCase()

  const needsSize = product.category === 'Clothing' && product.sizes?.length > 0

  function handleAddToCart() {
    if (needsSize && !selectedSize) {
      setSizeError(true)
      // Trigger shake animation by remounting class
      if (sizeRef.current) {
        sizeRef.current.classList.remove('animate-shake')
        void sizeRef.current.offsetWidth // reflow
        sizeRef.current.classList.add('animate-shake')
      }
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    const variantImage = selectedVariant?.image_url || product.image_url
    addToCart({
      ...product,
      image: variantImage,
      image_url: variantImage,
      selectedSize,
      variant: selectedVariant || null,
    })
    openDrawer()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleInquiryChange(e) {
    setInquiry({ ...inquiry, [e.target.name]: e.target.value })
  }

  function handleInquirySubmit(e) {
    e.preventDefault()
    // TODO: wire to backend inquiry endpoint
    setInquirySubmitted(true)
  }

  return (
    <main className="bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-rule">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-mute">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${categorySlug}`} className="hover:text-ink transition-colors">
            {categoryDisplay}
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* ── Product layout ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* ── Image ── */}
          <div className="relative overflow-hidden bg-paper">
            {(selectedVariant?.image_url || product.image_url) ? (
              <img
                src={selectedVariant?.image_url || product.image_url}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-ink/5 flex items-center justify-center">
                <p className="text-mute text-[10px] tracking-[0.3em] uppercase font-semibold">
                  Coming Soon
                </p>
              </div>
            )}
            {/* Collection badge — top-left overlay */}
            {product.collection && (
              <div className="absolute top-4 left-4">
                <span className="bg-ink text-white text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1.5">
                  {product.collection}
                </span>
              </div>
            )}
            {/* Shirt type badge — bottom-left */}
            {typeLabel && (
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 text-ink text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5">
                  {typeLabel}
                </span>
              </div>
            )}
            {/* Category chip — always shown, links back */}
            <div className="absolute top-4 right-4">
              <Link
                to={`/category/${categorySlug}`}
                className="bg-white/90 text-ink text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 hover:bg-ink hover:text-white transition-colors"
              >
                {categoryDisplay}
              </Link>
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col gap-7">

            {/* Brand link */}
            {brand && (
              <Link
                to={`/brand/${product.brand_id}`}
                className="text-mute text-[10px] tracking-[0.3em] uppercase font-semibold hover:text-ink transition-colors"
              >
                {brand.name} →
              </Link>
            )}

            <div>
              <h1
                className="text-ink font-black uppercase leading-tight mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', letterSpacing: '0.04em' }}
              >
                {product.name}
              </h1>
              <p className="text-ink font-black text-2xl">${product.price}</p>
            </div>

            <div className="w-full h-px bg-rule" />

            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>

            {/* Color swatches */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-ink mb-3">
                  Color{selectedVariant?.color && <span className="text-mute font-normal"> — {selectedVariant.color}</span>}
                </p>
                <div className="flex items-center gap-3">
                  {product.variants.map((v) => {
                    const swatch = { White: '#ffffff', Black: '#111111', Grey: '#8a8a8a' }[v.color] || '#ccc'
                    const isSelected = selectedVariant?.color === v.color
                    return (
                      <button
                        key={v.color}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        aria-label={v.color}
                        className={`w-9 h-9 rounded-full border transition-all ${
                          isSelected
                            ? 'border-ink ring-2 ring-ink ring-offset-2'
                            : 'border-rule hover:border-ink'
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {needsSize && (
              <div ref={sizeRef}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">
                    Size{' '}
                    {selectedSize
                      ? <span className="text-mute font-normal">— {selectedSize}</span>
                      : sizeError && <span className="text-red-500 font-normal normal-case tracking-normal">— Please select a size</span>
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-mute hover:text-ink transition-colors"
                  >
                    Size Guide →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(product.sizes) ? product.sizes : []).map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false) }}
                      className={`text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-2 border transition-colors ${
                        selectedSize === size
                          ? 'bg-ink text-white border-ink'
                          : sizeError
                            ? 'border-red-400 text-red-400 hover:border-ink hover:text-ink'
                            : 'border-rule text-mute hover:border-ink hover:text-ink'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CTA ── */}
            {!isService ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 transition-colors duration-200 flex-1 ${
                    added
                      ? 'bg-paper text-ink border border-rule'
                      : 'bg-ink text-white hover:bg-ink/80'
                  }`}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={openDrawer}
                  className="border border-rule text-ink font-black text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-ink transition-colors duration-200"
                >
                  View Cart
                </button>
              </div>
            ) : inquirySubmitted ? (
              <div className="border border-rule p-6 text-center">
                <div className="w-8 h-px bg-ink mx-auto mb-4" />
                <p className="text-ink font-black uppercase tracking-wide text-sm mb-2">
                  Inquiry Sent
                </p>
                <p className="text-mute text-xs leading-relaxed">
                  We'll be in touch within 2–3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4 pt-2">
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">
                  Request a Quote
                </p>
                {[
                  { name: 'name',        placeholder: 'Your name',                     required: true },
                  { name: 'email',       placeholder: 'Email address',                 required: true },
                  { name: 'description', placeholder: 'Describe your project',         required: true },
                  { name: 'size',        placeholder: 'Size / dimensions (if applicable)' },
                  { name: 'timeline',    placeholder: 'Desired timeline' },
                  { name: 'budget',      placeholder: 'Budget range' },
                ].map((field) => (
                  <input
                    key={field.name}
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={inquiry[field.name]}
                    onChange={handleInquiryChange}
                    className="border border-rule px-4 py-3 text-sm text-ink placeholder-gray-300 focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                ))}
                <button
                  type="submit"
                  className="bg-ink text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors duration-200"
                >
                  Send Inquiry
                </button>
              </form>
            )}

            {/* ── Sold by strip ── */}
            {brand && (
              <div className="border border-rule p-5">
                <p className="text-mute text-[10px] tracking-[0.2em] uppercase mb-2">Sold by</p>
                <Link
                  to={`/brand/${product.brand_id}`}
                  className="text-ink font-black text-sm uppercase tracking-wide hover:text-mute transition-colors"
                >
                  {brand.name} →
                </Link>
                {brand.location && (
                  <p className="text-mute text-xs mt-1">{brand.location}</p>
                )}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── Related products ── */}
      {(relatedLoading || related.length > 0) && (
        <section className="bg-paper py-16 px-6 border-t border-rule">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-mute text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">
                  More from
                </p>
                <h2 className="text-ink font-black uppercase tracking-wide text-xl">
                  {product.collection}
                </h2>
              </div>
              <Link
                to={`/category/${categorySlug}`}
                className="text-[11px] tracking-[0.1em] uppercase font-bold text-mute hover:text-ink transition-colors"
              >
                View All →
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white">
                    <div className="aspect-[4/5] bg-ink/10 animate-pulse" />
                    <div className="p-4 border-t border-rule flex flex-col gap-2">
                      <div className="h-2.5 w-16 bg-ink/10 animate-pulse" />
                      <div className="h-4 w-full bg-ink/10 animate-pulse" />
                      <div className="h-3.5 w-12 bg-ink/10 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule">
                {related.map((p) => <RelatedProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

    </main>
  )
}
