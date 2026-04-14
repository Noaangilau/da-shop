import { Link, useSearchParams } from 'react-router-dom'

// ─── Demo Data ────────────────────────────────────────────────────────────────

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

const categories = [
  {
    label: 'Clothing',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Food',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Art',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
]

const products = [
  {
    id: 1,
    name: 'Custom Tatau Flash Sheet',
    vendor: 'Frost City Tatau',
    price: 85,
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
  },
  {
    id: 2,
    name: "Sāmoan Pe'a Art Print",
    vendor: 'Frost City Tatau',
    price: 45,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
  },
  {
    id: 3,
    name: 'Taro & Coconut Cream Bread',
    vendor: "D's Fale Mā",
    price: 12,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
  },
  {
    id: 4,
    name: 'Oka Ika Seasoning Pack',
    vendor: "D's Fale Mā",
    price: 28,
    image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
  },
  {
    id: 5,
    name: 'Island Linen Tapa Shirt',
    vendor: 'ffiliku',
    price: 120,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    category: 'Clothing',
  },
  {
    id: 6,
    name: 'Vā Collection Tote',
    vendor: 'ffiliku',
    price: 65,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    category: 'Accessories',
  },
]

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category')
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products

  return (
    <main className="pt-16">

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
      >
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
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase font-medium mb-8">
            The Pacific Marketplace
          </p>

          <h1
            className="text-white font-black uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', letterSpacing: '0.04em' }}
          >
            DA SHOP
          </h1>

          <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-14">
            Pacific Culture. All in One Place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#products"
              className="bg-white text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-white/90 transition-colors duration-200"
            >
              Explore Da Shop
            </a>
            <Link
              to="/become-a-vendor"
              className="border border-white/40 text-white text-xs tracking-widest uppercase font-bold px-10 py-4 hover:border-white hover:bg-white/10 transition-colors duration-200"
            >
              Become a Vendor
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-10 bg-white" />
          <p className="text-white text-xs tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Featured Stores ── */}
      <section className="bg-white py-24 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-3">
              Our Vendors
            </p>
            <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
              Featured Stores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.id}`}
                className="group bg-white overflow-hidden"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                <div className="p-6">
                  <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-1">
                    {vendor.category}
                  </p>
                  <h3 className="text-midnight text-lg font-black uppercase tracking-wide mb-2">
                    {vendor.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {vendor.bio}
                  </p>
                  <span className="text-midnight text-xs tracking-widest uppercase font-bold group-hover:text-muted transition-colors">
                    Visit Store →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="bg-sand py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-3">
              Browse
            </p>
            <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/?category=${cat.label}`}
                className="group relative overflow-hidden aspect-square"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-xs uppercase tracking-widest">
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="products" className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-3">
                {selectedCategory ? selectedCategory : 'New Arrivals'}
              </p>
              <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
                {selectedCategory ? `${selectedCategory} Products` : 'Featured Products'}
              </h2>
            </div>
            {selectedCategory && (
              <Link
                to="/"
                className="text-muted text-xs tracking-widest uppercase font-semibold hover:text-midnight transition-colors"
              >
                ← All Products
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-gray-100">
            {filteredProducts.length === 0 ? (
              <div className="col-span-3 py-20 text-center bg-white">
                <p className="text-muted text-sm uppercase tracking-widest">No products found in this category.</p>
                <Link to="/" className="text-midnight text-xs tracking-widest uppercase font-bold mt-5 inline-block hover:text-muted transition-colors">
                  View All →
                </Link>
              </div>
            ) : filteredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
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
        </div>
      </section>

      {/* ── Vendor CTA Banner ── */}
      <section className="bg-midnight py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase font-semibold mb-4">
            Are you a Pacific vendor?
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-wide mb-6 leading-tight">
            Sell on Da Shop
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-12 max-w-md mx-auto">
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
