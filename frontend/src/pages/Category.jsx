import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products, categories } from '../data/products'
import { brands } from '../data/brands'

// ─── Category Page — /category/:slug ─────────────────────────────────────────

export default function Category() {
  const { slug } = useParams()
  const [activeBrand, setActiveBrand] = useState('All')

  // Match slug to category
  const matched = categories.find((c) => c.slug === slug)
  const label = matched ? matched.label : slug
  const displayLabel = matched?.displayLabel || matched?.label || slug

  // Filter products to this category (products only, no services)
  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === label.toLowerCase() && p.type !== 'service'
  )

  // Also include Art Services if slug is art-services
  const isServices = slug === 'art-services'
  const serviceProducts = isServices
    ? products.filter((p) => p.type === 'service')
    : []

  const allRelevant = isServices ? serviceProducts : categoryProducts

  // Brands in this category for the brand filter
  const brandsInCategory = ['All', ...new Set(allRelevant.map((p) => p.brand))]

  const filtered =
    activeBrand === 'All'
      ? allRelevant
      : allRelevant.filter((p) => p.brand === activeBrand)

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
          <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-4">
            {filtered.length} {isServices ? 'services' : 'products'}
          </p>
        </div>
      </section>

      {/* ── Products / Services ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-muted mb-10">
            <Link to="/" className="hover:text-midnight transition-colors">Home</Link>
            <span>/</span>
            <span className="text-midnight">{displayLabel}</span>
          </div>

          {/* ── Brand filter pills ── */}
          {brandsInCategory.length > 2 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 pb-10 border-b border-[#E5E5E5]">
              <span className="text-muted text-[10px] tracking-[0.15em] uppercase mr-2">Brand:</span>
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

          {/* No results */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center bg-white">
              <p className="text-muted text-sm uppercase tracking-widest mb-6">
                No {isServices ? 'services' : 'products'} in this category yet.
              </p>
              <Link
                to="/"
                className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.12em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
              >
                Browse All
              </Link>
            </div>
          ) : isServices ? (
            /* ── Art Services layout ── */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E5E5]">
              {filtered.map((service) => (
                <Link
                  key={service.id}
                  to={`/product/${service.id}`}
                  className="group bg-white overflow-hidden"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-300" />
                  </div>
                  <div className="p-6 border-t border-[#E5E5E5]">
                    <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">
                      {service.brand}
                    </p>
                    <h3 className="text-midnight font-black uppercase tracking-wide text-base mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">
                      {service.description.substring(0, 100)}...
                    </p>
                    <p className="text-midnight font-bold text-sm">
                      From ${service.startingAt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ── Standard product grid ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-midnight text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
                        {displayLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#E5E5E5]">
                    <p className="text-muted text-[10px] tracking-[0.15em] uppercase font-medium mb-1">
                      {product.brand}
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
