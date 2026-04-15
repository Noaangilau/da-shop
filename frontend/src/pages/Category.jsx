import { Link, useParams } from 'react-router-dom'
import { products, categories } from '../data/products'

export default function Category() {
  const { slug } = useParams()

  // Match slug to category label (case-insensitive)
  const matched = categories.find(
    (c) => c.label.toLowerCase() === slug.toLowerCase()
  )
  const label = matched ? matched.label : slug

  const filtered = products.filter(
    (p) => p.category.toLowerCase() === label.toLowerCase()
  )

  return (
    <main className="pt-[88px]">

      {/* ── Header ── */}
      <section
        className="relative py-28 px-6 flex items-center justify-center text-center"
        style={{
          backgroundImage: matched
            ? `url('${matched.image.replace('w=600', 'w=1400')}')`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: matched ? undefined : '#111111',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase font-medium mb-5">
            Browse
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-wide">
            {label}
          </h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-4">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted mb-12">
            <Link to="/" className="hover:text-midnight transition-colors">Home</Link>
            <span>/</span>
            <span className="text-midnight">{label}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center bg-white">
              <p className="text-muted text-sm uppercase tracking-widest mb-6">
                No products in this category yet.
              </p>
              <Link
                to="/"
                className="inline-block bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200">
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
                    <div className="absolute top-3 left-3">
                      <span className="bg-white text-midnight text-xs font-bold tracking-widest uppercase px-2 py-1">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-muted text-xs tracking-widest uppercase font-medium mb-1">
                      {product.vendor}
                    </p>
                    <h3 className="text-midnight font-bold text-sm mb-3 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-midnight font-black text-base">
                      ${product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Other Categories ── */}
      <section className="bg-white py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-8">
            More Categories
          </p>
          <div className="flex flex-wrap gap-3">
            {categories
              .filter((c) => c.label.toLowerCase() !== label.toLowerCase())
              .map((c) => (
                <Link
                  key={c.label}
                  to={`/category/${c.label.toLowerCase()}`}
                  className="border border-gray-200 text-midnight text-xs tracking-widest uppercase font-bold px-6 py-3 hover:border-midnight hover:bg-midnight hover:text-white transition-colors duration-200"
                >
                  {c.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

    </main>
  )
}
