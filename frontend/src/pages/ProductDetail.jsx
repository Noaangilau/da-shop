import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Derive a human-readable shirt-type label from product fields
function getTypeLabel(product) {
  const name = product.name?.toLowerCase() || ''
  const col  = product.collection?.toLowerCase() || ''
  if (name.includes('long sleeve') || col.includes('long sleeve')) return 'Long Sleeve'
  if (name.includes('hoodie') || col.includes('hoodie'))             return 'Hoodie'
  if (name.includes('crewneck') || col.includes('crewneck'))         return 'Crewneck'
  if (name.includes('fleece') || col.includes('fleece'))             return 'Fleece'
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
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {product.collection && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-midnight text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
              {product.collection}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#E5E5E5]">
        <p className="text-muted text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
          {product.collection}
        </p>
        <h3 className="text-midnight font-bold text-[13px] mb-2 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <span className="text-midnight font-bold text-[13px]">${product.price}</span>
      </div>
    </Link>
  )
}

// ─── Product Detail Page — /product/:id ──────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError]       = useState(false)

  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError]       = useState(false)
  const [added, setAdded]               = useState(false)
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
    setSizeError(false)
    setAdded(false)
    setRelated([])

    axios.get(`${API_URL}/products/${id}`)
      .then((res) => {
        setProduct(res.data)
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
      <main className="pt-[88px] bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="aspect-square bg-midnight/10 animate-pulse" />
            <div className="flex flex-col gap-5 pt-4">
              <div className="h-3 w-32 bg-midnight/10 animate-pulse" />
              <div className="h-10 w-3/4 bg-midnight/10 animate-pulse" />
              <div className="h-6 w-20 bg-midnight/10 animate-pulse" />
              <div className="h-px w-full bg-[#E5E5E5]" />
              <div className="h-3 w-full bg-midnight/10 animate-pulse" />
              <div className="h-3 w-5/6 bg-midnight/10 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || (!loading && !product)) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase mb-4">404</p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-6">
            Product Not Found
          </h1>
          <Link to="/" className="bg-midnight text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 inline-block hover:bg-midnight/80 transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted text-sm uppercase tracking-widest">
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
    addToCart({ ...product, image: product.image_url, selectedSize })
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
    <main className="pt-[88px] bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-muted">
          <Link to="/" className="hover:text-midnight transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${categorySlug}`} className="hover:text-midnight transition-colors">
            {categoryDisplay}
          </Link>
          <span>/</span>
          <span className="text-midnight truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* ── Product layout ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* ── Image ── */}
          <div className="relative overflow-hidden bg-[#F7F7F7]">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {/* Collection badge — top-left overlay */}
            {product.collection && (
              <div className="absolute top-4 left-4">
                <span className="bg-midnight text-white text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1.5">
                  {product.collection}
                </span>
              </div>
            )}
            {/* Shirt type badge — bottom-left */}
            {typeLabel && (
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 text-midnight text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5">
                  {typeLabel}
                </span>
              </div>
            )}
            {/* Category chip — always shown, links back */}
            <div className="absolute top-4 right-4">
              <Link
                to={`/category/${categorySlug}`}
                className="bg-white/90 text-midnight text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 hover:bg-midnight hover:text-white transition-colors"
              >
                {categoryDisplay}
              </Link>
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col gap-7">

            {/* Brand link */}
            <Link
              to={`/brand/${product.brand_id}`}
              className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold hover:text-midnight transition-colors"
            >
              Filiku Design Co. →
            </Link>

            <div>
              <h1
                className="text-midnight font-black uppercase leading-tight mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', letterSpacing: '0.04em' }}
              >
                {product.name}
              </h1>
              <p className="text-midnight font-black text-2xl">${product.price}</p>
            </div>

            <div className="w-full h-px bg-[#E5E5E5]" />

            {/* Kaikefiu disclaimer */}
            {product.kaikefiu && (
              <div className="border border-[#E5E5E5] p-4 bg-[#F7F7F7]">
                <p className="text-[10px] tracking-[0.15em] uppercase font-black text-midnight mb-1">
                  Kaikefiu Series
                </p>
                <p className="text-muted text-xs leading-relaxed">
                  Pacific identity parody apparel. These designs are commentary on the cultural mashup of growing up Polynesian in America.{' '}
                  <em>Kaikefiu</em> (n.) — one who indulges excessively in American things.
                </p>
              </div>
            )}

            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>

            {/* Size selector */}
            {needsSize && (
              <div ref={sizeRef}>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight mb-3">
                  Size{' '}
                  {selectedSize
                    ? <span className="text-muted font-normal">— {selectedSize}</span>
                    : sizeError && <span className="text-red-500 font-normal normal-case tracking-normal">— Please select a size</span>
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(product.sizes) ? product.sizes : []).map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false) }}
                      className={`text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-2 border transition-colors ${
                        selectedSize === size
                          ? 'bg-midnight text-white border-midnight'
                          : sizeError
                            ? 'border-red-400 text-red-400 hover:border-midnight hover:text-midnight'
                            : 'border-[#E5E5E5] text-muted hover:border-midnight hover:text-midnight'
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
                      ? 'bg-[#F7F7F7] text-midnight border border-[#E5E5E5]'
                      : 'bg-midnight text-white hover:bg-midnight/80'
                  }`}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <Link
                  to="/cart"
                  className="border border-[#E5E5E5] text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:border-midnight transition-colors duration-200 text-center"
                >
                  View Cart
                </Link>
              </div>
            ) : inquirySubmitted ? (
              <div className="border border-[#E5E5E5] p-6 text-center">
                <div className="w-8 h-px bg-midnight mx-auto mb-4" />
                <p className="text-midnight font-black uppercase tracking-wide text-sm mb-2">
                  Inquiry Sent
                </p>
                <p className="text-muted text-xs leading-relaxed">
                  We'll be in touch within 2–3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4 pt-2">
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight">
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
                    className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                  />
                ))}
                <button
                  type="submit"
                  className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors duration-200"
                >
                  Send Inquiry
                </button>
              </form>
            )}

            {/* ── Sold by strip ── */}
            <div className="border border-[#E5E5E5] p-5">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase mb-2">Sold by</p>
              <Link
                to={`/brand/${product.brand_id}`}
                className="text-midnight font-black text-sm uppercase tracking-wide hover:text-muted transition-colors"
              >
                Filiku Design Co. →
              </Link>
              <p className="text-muted text-xs mt-1">Salt Lake City, Utah</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Related products ── */}
      {(relatedLoading || related.length > 0) && (
        <section className="bg-[#F7F7F7] py-16 px-6 border-t border-[#E5E5E5]">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">
                  More from
                </p>
                <h2 className="text-midnight font-black uppercase tracking-wide text-xl">
                  {product.collection}
                </h2>
              </div>
              <Link
                to={`/category/${categorySlug}`}
                className="text-[11px] tracking-[0.1em] uppercase font-bold text-muted hover:text-midnight transition-colors"
              >
                View All →
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E5E5]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white">
                    <div className="aspect-[4/5] bg-midnight/10 animate-pulse" />
                    <div className="p-4 border-t border-[#E5E5E5] flex flex-col gap-2">
                      <div className="h-2.5 w-16 bg-midnight/10 animate-pulse" />
                      <div className="h-4 w-full bg-midnight/10 animate-pulse" />
                      <div className="h-3.5 w-12 bg-midnight/10 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E5E5]">
                {related.map((p) => <RelatedProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

    </main>
  )
}
