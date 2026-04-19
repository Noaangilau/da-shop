import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { categories } from '../data/products'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Clothing subcategory filters ─────────────────────────────────────────────
const clothingSubcategories = [
  { label: 'All',          sub: 'all' },
  { label: 'New Arrivals', sub: 'new' },
  { label: 'T-Shirts',     sub: 't-shirts' },
  { label: 'Shirts',       sub: 'shirts' },
  { label: 'Fleece',       sub: 'fleece' },
  { label: 'Outerwear',    sub: 'outerwear' },
  { label: 'Denim',        sub: 'denim' },
  { label: 'Bottoms',      sub: 'bottoms' },
  { label: 'Footwear',     sub: 'footwear' },
  { label: 'Men',          sub: 'men' },
  { label: 'Women',        sub: 'women' },
  { label: 'Accessories',  sub: 'accessories' },
]

function ProductSkeleton() {
  return (
    <div className="bg-white">
      <div className="aspect-[4/5] bg-midnight/10 animate-pulse" />
      <div className="p-4 border-t border-[#E5E5E5] flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-midnight/10 animate-pulse" />
        <div className="h-4 w-full bg-midnight/10 animate-pulse" />
        <div className="h-3.5 w-12 bg-midnight/10 animate-pulse" />
      </div>
    </div>
  )
}

// ─── Category Page — /category/:slug ─────────────────────────────────────────

export default function Category() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeBrand, setActiveBrand] = useState('All')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const activeSub = searchParams.get('sub') || 'all'
  const isClothing = slug === 'clothing'
  const isServices = slug === 'art-services'

  const matched = categories.find((c) => c.slug === slug)
  const label = matched ? matched.label : slug
  const displayLabel = matched?.displayLabel || matched?.label || slug

  useEffect(() => {
    setLoading(true)
    setError(false)
    setActiveBrand('All')

    const params = {}
    if (!isServices) params.category = label
    else params.category = 'Art Services'

    axios.get(`${API_URL}/products`, { params })
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Brand filter options derived from loaded products
  const brandsInCategory = ['All', ...new Set(products.map((p) => p.subcategory).filter(Boolean))]

  // Brand filter
  const brandFiltered =
    activeBrand === 'All' ? products : products.filter((p) => p.subcategory === activeBrand)

  // Subcategory filter (clothing only)
  let filtered = brandFiltered
  if (isClothing && activeSub !== 'all' && activeSub !== 'new') {
    filtered = brandFiltered.filter(
      (p) => p.collection?.toLowerCase().replace(/\s+/g, '-') === activeSub ||
             p.subcategory?.toLowerCase() === activeSub
    )
  }

  function handleSubClick(sub) {
    if (sub === 'all') {
      searchParams.delete('sub')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ sub })
    }
    setActiveBrand('All')
  }

  return (
    <main className="pt-[88px]">

      {/* ── Category hero ── */}
      <section
        className="relative py-28 px-6 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: matched ? `url('${matched.image.replace('w=800', 'w=1400')}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: matched ? undefined : '#111111',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-medium mb-5">
            Category
          </p>
          <h1
            className="text-white font-black uppercase"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.04em' }}
          >
            {displayLabel}
          </h1>
          {!loading && (
            <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-4">
              {filtered.length} {isServices ? 'services' : 'products'}
            </p>
          )}
        </div>
      </section>

      {/* ── Clothing subcategory nav bar ── */}
      {isClothing && (
        <div className="bg-white border-b border-[#E5E5E5] overflow-x-auto">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center gap-0 min-w-max">
              {clothingSubcategories.map((item) => (
                <button
                  key={item.sub}
                  onClick={() => handleSubClick(item.sub)}
                  className={`px-5 py-4 text-[11px] tracking-[0.1em] uppercase font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeSub === item.sub
                      ? 'border-midnight text-midnight'
                      : 'border-transparent text-muted hover:text-midnight'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Products / Services ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-muted mb-10">
            <Link to="/" className="hover:text-midnight transition-colors">Home</Link>
            <span>/</span>
            <span className="text-midnight">{displayLabel}</span>
          </div>

          {/* ── Brand filter pills (clothing: show collection filter) ── */}
          {!loading && isClothing && brandsInCategory.length > 2 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 pb-10 border-b border-[#E5E5E5]">
              <span className="text-muted text-[10px] tracking-[0.15em] uppercase mr-2">Collection:</span>
              {brandsInCategory.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrand(b)}
                  className={`text-[11px] tracking-[0.1em] uppercase font-medium px-5 py-2 border transition-colors duration-150 ${
                    activeBrand === b
                      ? 'bg-midnight text-white border-midnight'
                      : 'bg-white text-muted border-[#E5E5E5] hover:border-midnight hover:text-midnight'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {error ? (
            <div className="py-24 text-center bg-white">
              <p className="text-muted text-sm uppercase tracking-widest">
                Something went wrong. Try refreshing.
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center bg-white">
              <p className="text-muted text-sm uppercase tracking-widest mb-2">
                No products in this section yet.
              </p>
              <p className="text-gray-400 text-xs mb-8">
                Check back soon — new drops every week.
              </p>
              <button
                onClick={() => handleSubClick('all')}
                className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
              >
                View All {displayLabel}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white"
                >
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
                    <h3 className="text-midnight font-bold text-[13px] mb-2 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-midnight font-bold text-[13px]">
                      ${product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Other categories ── */}
      <section className="bg-white py-16 px-6 border-t border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-6">
            More Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.slug !== slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="border border-[#E5E5E5] text-midnight text-[11px] tracking-[0.12em] uppercase font-bold px-6 py-3 hover:border-midnight hover:bg-midnight hover:text-white transition-colors duration-200"
                >
                  {c.displayLabel || c.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

    </main>
  )
}
