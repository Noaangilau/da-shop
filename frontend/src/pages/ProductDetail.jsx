import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../data/products'
import { brands } from '../data/brands'
import { useCart } from '../context/CartContext'

// ─── Product Detail Page — /product/:id ──────────────────────────────────────
// Handles 3 product types: Clothing (size/color), Jewelry (material),
// Paintings & Prints (size/framed), and Art Services (inquiry form).

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === Number(id))
  const { addToCart } = useCart()

  // Selectable options state
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedPrintSize, setSelectedPrintSize] = useState(null)
  const [added, setAdded] = useState(false)

  // Inquiry form state (Art Services only)
  const [inquiry, setInquiry] = useState({
    name: '', email: '', description: '', size: '', timeline: '', budget: '',
  })
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  if (!product) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase mb-4">404</p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-6">
            Product Not Found
          </h1>
          <Link
            to="/"
            className="bg-midnight text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 inline-block hover:bg-midnight/80 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  const brand = brands.find((b) => b.id === product.brandId)
  const isService = product.type === 'service'

  function handleAddToCart() {
    addToCart(product)
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

  // Category display label
  const categoryDisplay =
    product.category === 'Paintings' ? 'Paintings & Prints' : product.category

  // Category slug for breadcrumb link
  const categorySlug =
    product.category === 'Paintings' ? 'paintings'
    : product.category === 'Art Services' ? 'art-services'
    : product.category.toLowerCase()

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
          <span className="text-midnight">{product.name}</span>
        </div>
      </div>

      {/* ── Product layout ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* ── Image ── */}
          <div className="relative overflow-hidden bg-[#F7F7F7]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <Link
                to={`/category/${categorySlug}`}
                className="bg-midnight text-white text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1.5 hover:bg-midnight/80 transition-colors"
              >
                {categoryDisplay}
              </Link>
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col gap-7">

            {/* Brand link */}
            <Link
              to={`/brand/${product.brandId}`}
              className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold hover:text-midnight transition-colors"
            >
              {product.brand} →
            </Link>

            {/* Name */}
            <div>
              <h1
                className="text-midnight font-black uppercase leading-tight mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', letterSpacing: '0.04em' }}
              >
                {product.name}
              </h1>

              {/* Price */}
              {isService ? (
                <p className="text-midnight font-black text-2xl">
                  From ${product.startingAt}
                </p>
              ) : (
                <p className="text-midnight font-black text-2xl">
                  ${product.price}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#E5E5E5]" />

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* ── Category-specific selectors ── */}

            {/* Clothing — size + color */}
            {product.category === 'Clothing' && (
              <>
                {product.sizes && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight mb-3">
                      Size {selectedSize && <span className="text-muted font-normal">— {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-2 border transition-colors ${
                            selectedSize === size
                              ? 'bg-midnight text-white border-midnight'
                              : 'border-[#E5E5E5] text-muted hover:border-midnight hover:text-midnight'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.colors && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight mb-3">
                      Color {selectedColor && <span className="text-muted font-normal">— {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-2 border transition-colors ${
                            selectedColor === color
                              ? 'bg-midnight text-white border-midnight'
                              : 'border-[#E5E5E5] text-muted hover:border-midnight hover:text-midnight'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Jewelry — material display */}
            {product.category === 'Jewelry' && product.material && (
              <div className="border border-[#E5E5E5] p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-1">Material</p>
                <p className="text-midnight font-bold text-sm">{product.material}</p>
              </div>
            )}

            {/* Paintings — size options */}
            {product.category === 'Paintings' && product.sizeOptions && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight mb-3">
                  Size {selectedPrintSize && <span className="text-muted font-normal">— {selectedPrintSize}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedPrintSize(size)}
                      className={`text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-2 border transition-colors ${
                        selectedPrintSize === size
                          ? 'bg-midnight text-white border-midnight'
                          : 'border-[#E5E5E5] text-muted hover:border-midnight hover:text-midnight'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {product.framed !== undefined && (
                  <p className="text-muted text-[10px] tracking-[0.1em] uppercase mt-3">
                    {product.framed ? 'Includes frame' : 'Unframed'}
                  </p>
                )}
              </div>
            )}

            {/* ── Details list ── */}
            {product.details && (
              <ul className="flex flex-col gap-2.5">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-[0.1em]">
                    <div className="w-1 h-1 bg-[#E5E5E5] flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {/* ── CTA — Add to Cart (products) or Inquiry Form (services) ── */}

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
                  {product.brand} will be in touch within 2–3 business days.
                </p>
              </div>
            ) : (
              /* ── Inquiry Form (Art Services) ── */
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4 pt-2">
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-midnight">
                  Request a Quote
                </p>
                {[
                  { name: 'name', placeholder: 'Your name', required: true },
                  { name: 'email', placeholder: 'Email address', required: true },
                  { name: 'description', placeholder: 'Describe your project', required: true },
                  { name: 'size', placeholder: 'Size / dimensions (if applicable)' },
                  { name: 'timeline', placeholder: 'Desired timeline' },
                  { name: 'budget', placeholder: 'Budget range (NZD)' },
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
                to={`/brand/${product.brandId}`}
                className="text-midnight font-black text-sm uppercase tracking-wide hover:text-muted transition-colors"
              >
                {product.brand} →
              </Link>
              {brand && (
                <p className="text-muted text-xs mt-1">{brand.location}</p>
              )}
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
