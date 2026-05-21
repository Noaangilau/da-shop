import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { categories } from '../data/products'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Home Page ────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="bg-white">
      <div className="aspect-[4/5] bg-ink/10 animate-pulse" />
      <div className="p-4 border-t border-rule flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-ink/10 animate-pulse" />
        <div className="h-4 w-full bg-ink/10 animate-pulse" />
        <div className="h-3.5 w-12 bg-ink/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All')
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        setProducts(data.filter((p) => p.type === 'product'))
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false))
  }, [])

  const safeProducts = (Array.isArray(products) ? products : []).filter(
    (p) => p.category === 'Clothing'
  )

  const categoryOptions = ['All', ...new Set(safeProducts.map((p) => p.category))]

  const filteredProducts = safeProducts.filter((p) => {
    return activeFilter === 'All' || p.category === activeFilter
  })

  return (
    <main className="">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-stretch">

          {/* LEFT: copy */}
          <div className="flex flex-col gap-8 justify-between py-6">
            <div className="flex flex-col gap-6">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
                CATALOG NO. 01 / PACIFIC MARKETPLACE
              </div>
              <h1
                className="font-display font-black uppercase leading-[0.9] tracking-[-0.03em] text-ink"
                style={{ fontSize: 'clamp(56px, 9vw, 140px)' }}
              >
                BASICS<br />FROM EVERY<br />STUDIO.
              </h1>
              <p className="max-w-lg text-[15px] leading-[1.55] text-ink/80">
                One catalog. Pacific brands and school stores — tees, long sleeves, crew necks, and hoodies, all in one place.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/category/clothing" className="btn-primary btn-lg inline-flex items-center gap-2">
                  SHOP THE CATALOG <span>→</span>
                </Link>
                <Link to="/schools" className="btn-outline btn-lg">
                  VIEW SCHOOLS
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div className="border-t border-ink pt-4 grid grid-cols-4 gap-4">
              {[
                ['BRANDS',     '02'],
                ['PRODUCTS',   safeProducts.length || '—'],
                ['SCHOOLS',    '01'],
                ['CATEGORIES', '04'],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute">{label}</div>
                  <div className="font-mono text-[18px] tabular-nums text-ink">{String(val).padStart(2, '0')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: art panel */}
          <div className="relative bg-ink text-paper aspect-[4/5] lg:aspect-auto overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 18px, rgba(245,241,234,0.06) 18px 19px)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg viewBox="0 0 100 100" className="w-[56%] h-auto" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
                <path d="M26 28 L38 18 L42 28 C46 22 54 22 58 28 L62 18 L74 28 L84 42 L76 48 L72 40 L72 86 L28 86 L28 40 L24 48 L16 42 Z" />
                <path d="M50 28 L50 50 M44 50 L56 50" />
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between font-mono text-[11px] tracking-[0.14em] uppercase">
              <span>FIG. A — WORKSHOP HOODIE</span>
              <span>DA SHOP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────────────────────────────── */}
      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-6 pb-[18px] border-b border-ink mb-7">
          <div>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute mb-2">BROWSE BY CATEGORY</div>
            <h2 className="font-display font-black uppercase text-[40px] leading-[0.95] tracking-[-0.02em] text-ink">EVERY BASIC, FILED.</h2>
          </div>
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute">04 CATEGORIES</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group border border-ink bg-paper hover:bg-ink hover:text-paper transition-colors duration-150 p-[18px] flex flex-col gap-[18px] min-h-[260px]"
            >
              <div className="flex justify-between">
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase">{cat.count || '—'} ITEMS</span>
              </div>
              <h3 className="font-display font-black uppercase text-[32px] leading-[0.95] tracking-[-0.02em] mt-auto">
                {cat.displayLabel || cat.label}
              </h3>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase self-end">VIEW &nbsp;→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── The Brands ───────────────────────────────────────────────────────── */}
      <section className="border-t border-ink py-16 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between gap-6 pb-[18px] border-b border-ink mb-7">
            <div>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute mb-2">THE MARKETPLACE</div>
              <h2 className="font-display font-black uppercase text-[40px] leading-[0.95] tracking-[-0.02em] text-ink">
                THE BRANDS.
              </h2>
            </div>
            <Link
              to="/brands"
              className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute hover:text-ink transition-colors"
            >
              ALL BRANDS →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink">
            {[
              {
                num: '01',
                name: 'FILIKU DESIGNS CO.',
                tagline: 'Heavyweight basics. Built to last.',
                bio: 'Mid-weight 7oz or higher, pre-shrunk, cut for a relaxed modern fit.',
                location: 'STUDIO 01',
                items: 11,
              },
              {
                num: '02',
                name: 'TRAPACCHINO',
                tagline: 'Graphic-forward streetwear.',
                bio: 'Small graphic-led drops. Each piece numbered, produced in limited runs.',
                location: 'STUDIO 02',
                items: 8,
              },
            ].map((brand) => (
              <Link
                key={brand.num}
                to="/brands"
                className="group bg-paper hover:bg-ink transition-colors duration-200 p-8 flex flex-col gap-6 min-h-[300px]"
              >
                <div className="flex justify-between font-mono text-[11px] tracking-[0.14em] uppercase text-mute group-hover:text-paper/50 transition-colors">
                  <span>BRAND / {brand.num}</span>
                  <span>{brand.items} ITEMS →</span>
                </div>
                <div
                  className="font-display font-black uppercase leading-[0.9] tracking-[-0.03em] text-ink group-hover:text-paper transition-colors"
                  style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}
                >
                  {brand.name}
                </div>
                <div className="mt-auto flex flex-col gap-1.5">
                  <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink group-hover:text-paper transition-colors">
                    {brand.tagline}
                  </p>
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute group-hover:text-paper/40 transition-colors">
                    {brand.location}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Products ─────────────────────────────────────────────────────── */}
      <section id="products" className="bg-white py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between gap-6 pb-[18px] border-b border-ink mb-7">
            <div>
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mute mb-2">NEW ARRIVALS</div>
              <h2 className="font-display font-black uppercase text-[40px] leading-[0.95] tracking-[-0.02em] text-ink">
                ALL PRODUCTS.
              </h2>
            </div>
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute">
              {safeProducts.length} ITEMS
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {categoryOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-[11px] tracking-[0.12em] uppercase px-5 py-2 border transition-colors duration-150 ${
                  activeFilter === f
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-white text-mute border-rule hover:border-ink hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-rule">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-mute text-sm uppercase tracking-widest mb-6">
                No products match this filter.
              </p>
              <button
                onClick={() => setActiveFilter('All')}
                className="bg-ink text-white font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-ink/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-rule">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-ink text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-rule">
                    <p className="text-mute text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                      {product.collection}
                    </p>
                    <h3 className="text-ink font-bold text-[13px] mb-2 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-ink font-bold text-[13px]">
                      ${product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Become a Vendor CTA ───────────────────────────────────────────────── */}
      <section className="bg-paper py-24 px-6 border-t border-rule">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <p className="text-mute text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">Pacific vendors</p>
            <h2
              className="text-ink font-black uppercase"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '0.04em' }}
            >
              Sell on DA SHOP
            </h2>
            <p className="text-mute text-sm leading-relaxed mt-4 max-w-md">
              Get your own branded storefront, reach new customers, and represent your culture — on your terms.
            </p>
          </div>
          <Link
            to="/become-a-vendor"
            className="flex-shrink-0 bg-ink text-white font-black text-[11px] tracking-[0.15em] uppercase px-12 py-4 hover:bg-ink/80 transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
