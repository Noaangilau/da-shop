import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { categories } from '../data/products'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Home Page ────────────────────────────────────────────────────────────────

function BrandCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="h-56 bg-midnight/10 animate-pulse" />
      <div className="p-5 border-t border-[#E5E5E5] flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-midnight/10 animate-pulse" />
        <div className="h-4 w-32 bg-midnight/10 animate-pulse" />
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
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

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeBrand, setActiveBrand] = useState('All')
  const navigate = useNavigate()

  const [brands, setBrands] = useState([])
  const [products, setProducts] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [featuredBrand, setFeaturedBrand] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/brands`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        setBrands(data)
        const first = data[0]
        if (first) {
          setFeaturedBrand(first)
          axios.get(`${API_URL}/brands/${first.id}/products`)
            .then((r) => {
              const items = Array.isArray(r.data) ? r.data : []
              setFeaturedProducts(items.filter((p) => p.type === 'product').slice(0, 4))
            })
            .catch(() => {})
        }
      })
      .catch(() => setBrands([]))
      .finally(() => setBrandsLoading(false))
  }, [])

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        setProducts(data.filter((p) => p.type === 'product'))
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false))
  }, [])

  const safeProducts = Array.isArray(products) ? products : []
  const safeBrands = Array.isArray(brands) ? brands : []

  const categoryOptions = ['All', ...new Set(safeProducts.map((p) => p.category))]
  const brandOptions = ['All', ...safeBrands.map((b) => b.name)]

  const filteredProducts = safeProducts.filter((p) => {
    const matchCat = activeFilter === 'All' || p.category === activeFilter
    const matchBrand = activeBrand === 'All' || p.brand_id === safeBrands.find((b) => b.name === activeBrand)?.id
    return matchCat && matchBrand
  })

  return (
    <main className="pt-[88px]">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-medium mb-8">
            The Pacific Marketplace
          </p>
          <h1
            className="text-white font-black uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', letterSpacing: '0.04em' }}
          >
            DA SHOP
          </h1>
          <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-14">
            Pacific Culture. All In One Place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#products"
              className="bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-white/90 transition-colors duration-200"
            >
              Shop Now
            </a>
            <Link
              to="/brands"
              className="border border-white/40 text-white text-[11px] tracking-[0.15em] uppercase font-bold px-10 py-4 hover:border-white hover:bg-white/10 transition-colors duration-200"
            >
              Meet the Brands
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-10 bg-white animate-pulse" />
          <p className="text-white text-[10px] tracking-[0.3em] uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-10">
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">Browse</p>
            <h2
              className="text-midnight font-black uppercase"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
            >
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5]">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden aspect-square bg-white"
              >
                <img
                  src={cat.image}
                  alt={cat.displayLabel || cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-white font-black text-xs uppercase tracking-[0.15em]">
                    {cat.displayLabel || cat.label}
                  </p>
                  <p className="text-white/50 text-[10px] uppercase tracking-[0.1em] mt-1 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Shop →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Brands ──────────────────────────────────────────────────── */}
      <section className="bg-[#F7F7F7] py-20 px-6 border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">The Marketplace</p>
              <h2
                className="text-midnight font-black uppercase"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
              >
                The Brands
              </h2>
            </div>
            <Link
              to="/brands"
              className="hidden sm:block text-muted text-[11px] tracking-[0.15em] uppercase font-semibold hover:text-midnight transition-colors"
            >
              All Brands →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5]">
            {brandsLoading
              ? [0, 1, 2, 3].map((i) => <BrandCardSkeleton key={i} />)
              : safeBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brand/${brand.id}`}
                    className="group bg-white overflow-hidden"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={brand.card_image_url}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-300" />
                      {brand.logo_white_url && (
                        <img
                          src={brand.logo_white_url}
                          alt=""
                          aria-hidden="true"
                          className="absolute top-4 left-4 h-12 w-auto object-contain opacity-90"
                        />
                      )}
                    </div>
                    <div className="p-5 border-t border-[#E5E5E5]">
                      <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">
                        {brand.category}
                      </p>
                      <h3 className="text-midnight font-black uppercase tracking-wide text-sm mb-1">
                        {brand.name}
                      </h3>
                      <p className="text-muted text-[10px] tracking-[0.1em] uppercase mt-3 group-hover:text-midnight transition-colors">
                        Shop Brand →
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ── THE CULTURE ──────────────────────────────────────────────────────── */}
      <section id="culture" className="bg-midnight py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-12">
            <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-semibold mb-3">Our World</p>
            <h2
              className="text-white font-black uppercase"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.04em' }}
            >
              The Culture
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {[
              {
                title: 'The Story',
                body: 'DA SHOP was built to give Pacific vendors a platform that understands the culture — not just the commerce. Every brand here is Pacific-led, community-rooted, and building something real.',
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                to: '/brands',
              },
              {
                title: 'The Artists',
                body: 'From tattoo artists to fine art painters, the creators behind DA SHOP brands are carrying Pacific tradition into the modern world. Each one has a story. Each one is building a legacy.',
                image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=600&q=80',
                to: '/brands',
              },
              {
                title: 'The Gallery',
                body: "Art, fashion, jewelry — all of it rooted in Pacific identity. Browse the editorial gallery to see how DA SHOP's brands express culture through their work.",
                image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
                to: '/gallery',
              },
            ].map((tile) => (
              <Link
                key={tile.title}
                to={tile.to}
                className="group relative overflow-hidden aspect-[4/5] bg-black"
              >
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <div className="w-6 h-px bg-white mb-5" />
                  <h3 className="text-white font-black uppercase tracking-wide text-base mb-3">{tile.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{tile.body}</p>
                  <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-5 group-hover:text-white transition-colors">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Brand Spotlight ─────────────────────────────────────────── */}
      {featuredBrand && (
        <section className="bg-white border-b border-[#E5E5E5]">
          {/* Editorial header */}
          <div className="relative h-[24rem] md:h-[32rem] overflow-hidden bg-midnight">
            {featuredBrand.hero_image_url && (
              <img
                src={featuredBrand.hero_image_url}
                alt={featuredBrand.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-[1280px] mx-auto px-6 pb-12 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-semibold mb-3">
                    Featured Brand
                  </p>
                  {featuredBrand.logo_white_url && (
                    <img
                      src={featuredBrand.logo_white_url}
                      alt={featuredBrand.name}
                      className="h-20 md:h-24 w-auto mb-5 object-contain object-left"
                    />
                  )}
                  <h2
                    className="text-white font-black uppercase leading-none"
                    style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.04em' }}
                  >
                    {featuredBrand.name}
                  </h2>
                  {featuredBrand.tagline && (
                    <p className="text-white/50 text-sm italic mt-3 max-w-md">"{featuredBrand.tagline}"</p>
                  )}
                </div>
                <Link
                  to={`/brand/${featuredBrand.id}`}
                  className="flex-shrink-0 bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3.5 hover:bg-white/90 transition-colors duration-200 self-end"
                >
                  Shop {featuredBrand.name} →
                </Link>
              </div>
            </div>
          </div>

          {/* 4-product preview grid */}
          {featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4 border-t border-[#E5E5E5]">
                    <p className="text-muted text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                      {product.collection}
                    </p>
                    <h3 className="text-midnight font-bold text-[13px] mb-2 leading-snug">{product.name}</h3>
                    <span className="text-midnight font-bold text-[13px]">${product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── All Products ─────────────────────────────────────────────────────── */}
      <section id="products" className="bg-white py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-10">
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">New Arrivals</p>
            <h2
              className="text-midnight font-black uppercase"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
            >
              All Products
            </h2>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categoryOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-[11px] tracking-[0.12em] uppercase font-bold px-5 py-2 border transition-colors duration-150 ${
                  activeFilter === f
                    ? 'bg-midnight text-white border-midnight'
                    : 'bg-white text-muted border-[#E5E5E5] hover:border-midnight hover:text-midnight'
                }`}
              >
                {f === 'Paintings' ? 'Paintings & Prints' : f}
              </button>
            ))}
          </div>

          {/* Brand filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-10 border-b border-[#E5E5E5]">
            <span className="text-muted text-[10px] tracking-[0.15em] uppercase mr-2">Brand:</span>
            {brandOptions.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBrand(b)}
                className={`text-[11px] tracking-[0.1em] uppercase font-medium px-4 py-1.5 border transition-colors duration-150 ${
                  activeBrand === b
                    ? 'bg-midnight text-white border-midnight'
                    : 'bg-white text-muted border-[#E5E5E5] hover:border-midnight hover:text-midnight'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-muted text-sm uppercase tracking-widest mb-6">
                No products match this filter.
              </p>
              <button
                onClick={() => { setActiveFilter('All'); setActiveBrand('All') }}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-midnight text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
                        {product.category}
                      </span>
                    </div>
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

      {/* ── Become a Vendor CTA ───────────────────────────────────────────────── */}
      <section className="bg-[#F7F7F7] py-24 px-6 border-t border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">Pacific vendors</p>
            <h2
              className="text-midnight font-black uppercase"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '0.04em' }}
            >
              Sell on DA SHOP
            </h2>
            <p className="text-muted text-sm leading-relaxed mt-4 max-w-md">
              Get your own branded storefront, reach new customers, and represent your culture — on your terms.
            </p>
          </div>
          <Link
            to="/become-a-vendor"
            className="flex-shrink-0 bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-12 py-4 hover:bg-midnight/80 transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
