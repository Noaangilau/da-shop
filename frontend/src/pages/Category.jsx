import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SUBCATEGORIES = ['T-SHIRTS', 'LONG SLEEVES', 'CREW NECKS', 'HOODIES']

const SORT_OPTIONS = [
  { value: 'featured',   label: 'FEATURED' },
  { value: 'price-asc',  label: 'PRICE: LOW–HIGH' },
  { value: 'price-desc', label: 'PRICE: HIGH–LOW' },
  { value: 'newest',     label: 'NEWEST' },
]

// Map a product to its display subcategory
function getSubLabel(product) {
  const n = (product.name || '').toLowerCase()
  const c = (product.collection || '').toLowerCase()
  if (n.includes('hoodie') || c.includes('hoodie'))                               return 'HOODIES'
  if (n.includes('long sleeve') || c.includes('long sleeve'))                     return 'LONG SLEEVES'
  if (n.includes('crewneck') || n.includes('crew neck') || c.includes('crew'))   return 'CREW NECKS'
  return 'T-SHIRTS'
}

// Swatch color map
const SWATCH = {
  White: '#ffffff', Black: '#111111', Grey: '#8a8a8a', Gray: '#8a8a8a',
  Bone: '#e8e0d0', Cream: '#f0e8d8', Navy: '#1a2744', Olive: '#4a4a35',
  Red: '#cc0000', Blue: '#2244aa', Green: '#2a5c3a', Brown: '#6b3c1a',
  Tan: '#c4a882', Khaki: '#c8b87a', Caramel: '#c68c3a',
}

function PlaceholderCard({ label }) {
  return (
    <div
      className="w-full aspect-[4/5] relative overflow-hidden flex items-center justify-center"
      style={{
        background: '#f5f1ea',
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 20px, rgba(0,0,0,0.025) 20px 21px)',
      }}
    >
      <svg viewBox="0 0 100 100" className="w-[38%] h-auto opacity-[0.12]" fill="none" stroke="#0a0a0a" strokeWidth={1.5} strokeLinejoin="round">
        <path d="M26 28 L38 18 L42 28 C46 22 54 22 58 28 L62 18 L74 28 L84 42 L76 48 L72 40 L72 86 L28 86 L28 40 L24 48 L16 42 Z" />
      </svg>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white">
      <div className="aspect-[4/5] bg-ink/10 animate-pulse" />
      <div className="p-4 border-t border-rule flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-ink/10 animate-pulse" />
        <div className="h-4 w-full bg-ink/10 animate-pulse" />
        <div className="h-3 w-20 bg-ink/10 animate-pulse" />
        <div className="h-3.5 w-12 bg-ink/10 animate-pulse" />
      </div>
    </div>
  )
}

// ── Checkbox component ─────────────────────────────────────────────────────────
function FilterCheck({ checked, onChange, label, count }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-0.5">
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
          <div className="w-[14px] h-[14px] border border-rule peer-checked:bg-ink peer-checked:border-ink transition-colors" />
          {checked && (
            <svg className="absolute inset-0 w-[14px] h-[14px] text-white p-[2px]" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 7l3 3 5.5-5.5" />
            </svg>
          )}
        </div>
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink group-hover:text-mute transition-colors">{label}</span>
      </div>
      {count != null && <span className="font-mono text-[10px] text-mute">{count}</span>}
    </label>
  )
}

// ── Filter section accordion ───────────────────────────────────────────────────
function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-rule">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-3.5 text-ink font-mono text-[11px] tracking-[0.12em] uppercase font-bold"
      >
        {title}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.5}
          className={`text-mute transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 3l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-4 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

// ── Main Category Page ─────────────────────────────────────────────────────────
export default function Category() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()

  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  // Filter state
  const [checkedSubs,   setCheckedSubs]   = useState(new Set())
  const [checkedBrands, setCheckedBrands] = useState(new Set())
  const [maxPrice,      setMaxPrice]      = useState(999)
  const [sortBy,        setSortBy]        = useState('featured')
  const [viewMode,      setViewMode]      = useState('grid')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  // Accordion open state
  const [subOpen,   setSubOpen]   = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)

  // Pre-select from URL ?sub= param
  useEffect(() => {
    const urlSub = searchParams.get('sub')
    const MAP = {
      't-shirts': 'T-SHIRTS', 'long-sleeves': 'LONG SLEEVES',
      'crew-necks': 'CREW NECKS', 'hoodies': 'HOODIES',
    }
    if (urlSub && MAP[urlSub]) setCheckedSubs(new Set([MAP[urlSub]]))
    else setCheckedSubs(new Set())
  }, [searchParams])

  // Fetch products
  useEffect(() => {
    setLoading(true)
    setError(false)
    axios.get(`${API_URL}/products`, { params: { category: 'Clothing' } })
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Derived counts
  const subCounts = useMemo(() => {
    const counts = {}
    SUBCATEGORIES.forEach((s) => { counts[s] = 0 })
    products.forEach((p) => { const s = getSubLabel(p); counts[s] = (counts[s] || 0) + 1 })
    return counts
  }, [products])

  const brandOptions = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      const b = p.subcategory || p.brand_name || 'Other'
      map[b] = (map[b] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [products])

  const maxPossible = useMemo(() => {
    if (!products.length) return 200
    return Math.ceil(Math.max(...products.map((p) => p.price || 0)) / 10) * 10 || 200
  }, [products])

  const qParam = searchParams.get('q')?.trim().toLowerCase() || ''

  // Apply filters + sort
  const filtered = useMemo(() => {
    let list = [...products]
    if (qParam) {
      list = list.filter((p) =>
        (p.name        || '').toLowerCase().includes(qParam) ||
        (p.brand_name  || '').toLowerCase().includes(qParam) ||
        (p.collection  || '').toLowerCase().includes(qParam)
      )
    }
    if (checkedSubs.size > 0)   list = list.filter((p) => checkedSubs.has(getSubLabel(p)))
    if (checkedBrands.size > 0) list = list.filter((p) => checkedBrands.has(p.subcategory || p.brand_name || 'Other'))
    list = list.filter((p) => (p.price || 0) <= maxPrice)
    if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [products, checkedSubs, checkedBrands, maxPrice, sortBy, qParam])

  function toggleSub(s) {
    setCheckedSubs((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })
  }
  function toggleBrand(b) {
    setCheckedBrands((prev) => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n })
  }
  function clearAll() {
    setCheckedSubs(new Set())
    setCheckedBrands(new Set())
    setMaxPrice(maxPossible)
  }

  const hasFilters    = checkedSubs.size > 0 || checkedBrands.size > 0
  const activeCount   = checkedSubs.size + checkedBrands.size
  const sortLabel     = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'FEATURED'

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="flex flex-col">
      <FilterSection title="CATEGORY" open={subOpen} onToggle={() => setSubOpen(!subOpen)}>
        {SUBCATEGORIES.map((sub) => (
          <FilterCheck
            key={sub}
            label={sub}
            count={subCounts[sub] || 0}
            checked={checkedSubs.has(sub)}
            onChange={() => toggleSub(sub)}
          />
        ))}
      </FilterSection>

      {brandOptions.length > 0 && (
        <FilterSection title="BRAND" open={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
          {brandOptions.map(([brand, count]) => (
            <FilterCheck
              key={brand}
              label={brand}
              count={count}
              checked={checkedBrands.has(brand)}
              onChange={() => toggleBrand(brand)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="MAX PRICE" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
        <div className="flex justify-between mb-2 font-mono text-[10px] tracking-[0.08em] uppercase text-mute">
          <span>$0</span>
          <span>≤ ${maxPrice}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPossible}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ink cursor-pointer"
        />
      </FilterSection>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-4 font-mono text-[10px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors text-left"
        >
          CLEAR ALL ×
        </button>
      )}
    </div>
  )

  return (
    <main className="bg-paper min-h-screen">

      {/* ── Page Header ── */}
      <div className="border-b border-ink">
        <div className="max-w-[1440px] mx-auto px-6 pt-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute mb-3">
                {qParam ? `SEARCH RESULTS FOR "${qParam.toUpperCase()}"` : 'EVERY BRAND, EVERY WEIGHT'}
              </p>
              <h1
                className="font-display font-black uppercase text-ink leading-[0.88] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}
              >
                {qParam ? 'RESULTS.' : 'ALL GARMENTS'}
              </h1>
            </div>
            {!loading && (
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute text-right flex-shrink-0 pb-1">
                {filtered.length} ITEMS · SORTED BY {sortLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-paper border-b border-rule sticky top-[88px] z-30 bg-paper">
        <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">

          {/* Left: FILTERS toggle */}
          <button
            onClick={() => setMobileSidebar(!mobileSidebar)}
            className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase text-ink hover:text-mute transition-colors"
          >
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <path d="M0 1h14M2 6h10M5 11h4" />
            </svg>
            FILTERS
            {activeCount > 0 && (
              <span className="bg-ink text-paper font-mono text-[9px] px-1.5 py-0.5 min-w-[18px] text-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Right: Sort + View mode */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute hidden sm:block">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink bg-paper border border-rule px-2.5 py-1.5 focus:outline-none focus:border-ink cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-7 h-7 flex items-center justify-center border transition-colors ${viewMode === 'grid' ? 'bg-ink text-paper border-ink' : 'border-rule text-mute hover:border-ink hover:text-ink'}`}
                aria-label="Grid view"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                  <rect x="0" y="0" width="4.5" height="4.5" /><rect x="6.5" y="0" width="4.5" height="4.5" />
                  <rect x="0" y="6.5" width="4.5" height="4.5" /><rect x="6.5" y="6.5" width="4.5" height="4.5" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-7 h-7 flex items-center justify-center border transition-colors ${viewMode === 'list' ? 'bg-ink text-paper border-ink' : 'border-rule text-mute hover:border-ink hover:text-ink'}`}
                aria-label="List view"
              >
                <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor">
                  <rect x="0" y="0" width="12" height="1.8" /><rect x="0" y="4.1" width="12" height="1.8" />
                  <rect x="0" y="8.2" width="12" height="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="flex gap-10 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[200px] flex-shrink-0 sticky top-[140px]">
            {sidebarContent}
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebar && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="bg-black/40 flex-1" onClick={() => setMobileSidebar(false)} />
              <div className="bg-paper w-[280px] h-full overflow-y-auto p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-mono text-[11px] tracking-[0.14em] uppercase font-bold text-ink">FILTERS</p>
                  <button onClick={() => setMobileSidebar(false)} className="text-mute hover:text-ink text-2xl leading-none">×</button>
                </div>
                {sidebarContent}
              </div>
            </div>
          )}

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="py-24 text-center">
                <p className="font-mono text-mute text-sm uppercase tracking-widest">Something went wrong. Try refreshing.</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-rule">
                {[0,1,2,3,4,5].map((i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-mono text-mute text-sm uppercase tracking-widest mb-6">No products match your filters.</p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="bg-ink text-paper font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-ink/80 transition-colors"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (

              /* ── Grid view ── */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-rule">
                {filtered.map((product, i) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">

                    {/* Image / placeholder */}
                    <div className="relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <PlaceholderCard label={getSubLabel(product).replace('S', '').trim()} />
                      )}
                      {/* SKU badge */}
                      <span className="absolute top-2 right-2.5 font-mono text-[9px] tracking-[0.08em] text-mute/50">
                        #{String(101 + i).padStart(3, '0')}
                      </span>
                      {/* Collection badge on hover */}
                      {product.collection && (
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-ink text-paper font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                            {product.collection}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card info */}
                    <div className="p-4 border-t border-rule">
                      <p className="font-mono text-mute text-[10px] tracking-[0.14em] uppercase mb-1">
                        {product.subcategory || product.brand_name || product.collection}
                      </p>
                      <h3 className="text-ink font-black uppercase text-[12px] tracking-[0.02em] leading-snug mb-2">
                        {product.name}
                      </h3>
                      {/* Color swatches from variants */}
                      {Array.isArray(product.variants) && product.variants.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          {product.variants.slice(0, 6).map((v) => (
                            <span
                              key={v.color}
                              title={v.color}
                              className="w-3 h-3 rounded-full border border-rule flex-shrink-0"
                              style={{ backgroundColor: SWATCH[v.color] || '#ccc' }}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-ink font-black text-[13px]">${product.price}</span>
                    </div>

                  </Link>
                ))}
              </div>

            ) : (

              /* ── List view ── */
              <div className="flex flex-col gap-px bg-rule">
                {filtered.map((product, i) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group bg-white flex gap-5 items-center p-5 hover:bg-paper/50 transition-colors">
                    <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: '#f5f1ea',
                            backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 10px, rgba(0,0,0,0.025) 10px 11px)',
                          }}
                        >
                          <svg viewBox="0 0 100 100" className="w-[55%] opacity-[0.12]" fill="none" stroke="#0a0a0a" strokeWidth={2} strokeLinejoin="round">
                            <path d="M26 28 L38 18 L42 28 C46 22 54 22 58 28 L62 18 L74 28 L84 42 L76 48 L72 40 L72 86 L28 86 L28 40 L24 48 L16 42 Z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-1 right-1 font-mono text-[8px] tracking-[0.05em] text-mute/40">
                        #{String(101 + i).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-mute text-[10px] tracking-[0.14em] uppercase mb-0.5">
                        {product.subcategory || product.brand_name || product.collection}
                      </p>
                      <h3 className="text-ink font-black uppercase text-[13px] tracking-[0.02em] leading-snug">
                        {product.name}
                      </h3>
                      {Array.isArray(product.variants) && product.variants.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {product.variants.slice(0, 5).map((v) => (
                            <span key={v.color} className="w-2.5 h-2.5 rounded-full border border-rule" style={{ backgroundColor: SWATCH[v.color] || '#ccc' }} title={v.color} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-ink font-black text-[13px]">${product.price}</span>
                    </div>
                  </Link>
                ))}
              </div>

            )}
          </div>
        </div>
      </div>

    </main>
  )
}
