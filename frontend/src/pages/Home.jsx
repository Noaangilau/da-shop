import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products, categories } from '../data/products'

const vendors = [
  {
    id: 1,
    name: 'Frost City Tatau',
    category: 'Art + Ink',
    bio: 'Custom Polynesian tattoo art, flash prints, and original Pacific designs.',
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: "D's Fale Mā",
    category: 'Food + Goods',
    bio: 'Authentic Pacific island foods, seasonings, and homemade goods straight from the fale.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'ffiliku',
    category: 'Fashion',
    bio: 'Contemporary island fashion rooted in Polynesian identity. Wear your culture.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  },
]

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All')
  const navigate = useNavigate()

  const filterOptions = ['All', ...categories.map((c) => c.label)]

  const filteredProducts =
    activeFilter === 'All'
      ? products
      : products.filter((p) => p.category === activeFilter)

  return (
    <main className="pt-[88px]">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-medium mb-8">
            The Pacific Marketplace
          </p>

          <h1
            className="text-white font-black uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', letterSpacing: '0.04em' }}
          >
            DA SHOP
          </h1>

          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase mb-14">
            Pacific Culture. All in One Place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#products"
              className="bg-white text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-white/90 transition-colors duration-200"
            >
              Shop Now
            </a>
            <Link
              to="/vendors"
              className="border border-white/30 text-white/80 text-xs tracking-widest uppercase font-bold px-10 py-4 hover:border-white hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              Our Vendors
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25">
          <div className="w-px h-10 bg-white" />
          <p className="text-white text-[10px] tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="bg-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">

          <div className="mb-10">
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
              Browse
            </p>
            <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gray-100">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/category/${cat.label.toLowerCase()}`}
                className="group relative overflow-hidden aspect-square bg-white"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="text-white font-black text-xs uppercase tracking-widest">
                    {cat.label}
                  </p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now →
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Featured Stores ── */}
      <section className="bg-sand py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
                Our Vendors
              </p>
              <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
                Featured Stores
              </h2>
            </div>
            <Link
              to="/vendors"
              className="hidden sm:block text-muted text-xs tracking-widest uppercase font-semibold hover:text-midnight transition-colors"
            >
              All Vendors →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.id}`}
                className="group bg-white overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-300" />
                </div>

                <div className="p-6 border-t border-gray-100">
                  <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">
                    {vendor.category}
                  </p>
                  <h3 className="text-midnight text-lg font-black uppercase tracking-wide mb-2">
                    {vendor.name}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    {vendor.bio}
                  </p>
                  <span className="text-midnight text-[10px] tracking-widest uppercase font-black group-hover:text-muted transition-colors">
                    Visit Store →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="products" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
                New Arrivals
              </p>
              <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
                All Products
              </h2>
            </div>
          </div>

          {/* ── Filter Pills (Lucid Blanks style) ── */}
          <div className="flex items-center gap-2 flex-wrap mb-10 pb-10 border-b border-gray-100">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs tracking-widest uppercase font-bold px-5 py-2 border transition-colors duration-150 ${
                  activeFilter === f
                    ? 'bg-midnight text-white border-midnight'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-midnight hover:text-midnight'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-muted text-sm uppercase tracking-widest mb-6">
                No products in this category yet.
              </p>
              <button
                onClick={() => setActiveFilter('All')}
                className="bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
              >
                View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-white text-midnight text-[10px] font-black tracking-widest uppercase px-2 py-1">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <p className="text-muted text-[10px] tracking-widest uppercase font-medium mb-1">
                      {product.vendor}
                    </p>
                    <h3 className="text-midnight font-bold text-sm mb-2 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-midnight font-black text-sm">
                      ${product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeFilter !== 'All' && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(`/category/${activeFilter.toLowerCase()}`)}
                className="text-muted text-xs tracking-widest uppercase font-semibold hover:text-midnight transition-colors"
              >
                See all {activeFilter} →
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ── Vendor CTA Banner ── */}
      <section className="bg-midnight py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-semibold mb-5">
            Are you a Pacific vendor?
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-wide mb-6 leading-tight">
            Sell on Da Shop
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-12 max-w-md mx-auto">
            Join a growing marketplace built for Pacific vendors. Get your own storefront, reach new customers, and represent your culture.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-white text-midnight font-black text-xs tracking-widest uppercase px-12 py-4 hover:bg-white/90 transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
