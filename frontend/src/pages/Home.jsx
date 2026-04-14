import { Link } from 'react-router-dom'

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
  return (
    <main className="pt-16">

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundColor: '#111111' }}
      >
        {/* Subtle background texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-midnight/70" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Gold accent line */}
          <div className="w-16 h-0.5 bg-gold mx-auto mb-8" />

          <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-6">
            The Pacific Marketplace
          </p>

          <h1
            className="text-white font-black uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.05em' }}
          >
            DA SHOP
          </h1>

          <p className="text-white/60 text-base md:text-lg tracking-widest uppercase mb-12">
            Pacific Culture. All in One Place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#products"
              className="bg-gold text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-gold-muted transition-colors duration-200"
            >
              Explore Da Shop
            </a>
            <Link
              to="/become-a-vendor"
              className="border border-white/30 text-white text-xs tracking-widest uppercase font-bold px-10 py-4 hover:border-gold hover:text-gold transition-colors duration-200"
            >
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gold" />
          <p className="text-gold text-xs tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Vendor Strip ── */}
      <section className="bg-midnight py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-3">
              Our Vendors
            </p>
            <h2 className="text-white text-3xl md:text-4xl font-black uppercase tracking-wide">
              Featured Stores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.id}`}
                className="group relative overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-midnight/50 group-hover:bg-midnight/30 transition-colors duration-300" />
                </div>

                {/* Info */}
                <div className="bg-white/5 border border-white/10 p-6">
                  <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-1">
                    {vendor.category}
                  </p>
                  <h3 className="text-white text-lg font-black uppercase tracking-wide mb-2">
                    {vendor.name}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">
                    {vendor.bio}
                  </p>
                  <span className="text-white text-xs tracking-widest uppercase font-bold group-hover:text-white/60 transition-colors">
                    Visit Store →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="bg-sand py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-isle-teal text-xs tracking-widest uppercase font-semibold mb-3">
              Browse
            </p>
            <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/?category=${cat.label}`}
                className="group relative overflow-hidden aspect-square"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-midnight/40 group-hover:bg-midnight/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-sm uppercase tracking-widest">
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="products" className="bg-sand py-24 px-6 border-t border-midnight/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-isle-teal text-xs tracking-widest uppercase font-semibold mb-3">
              New Arrivals
            </p>
            <h2 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide">
              Featured Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-midnight text-white text-xs font-bold tracking-widest uppercase px-2 py-1">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-midnight/40 text-xs tracking-widest uppercase font-medium mb-1">
                    {product.vendor}
                  </p>
                  <h3 className="text-midnight font-bold text-base mb-3 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-midnight font-black text-lg">
                      ${product.price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendor CTA Banner ── */}
      <section className="bg-isle-teal py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-4">
            Are you a Pacific vendor?
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-black uppercase tracking-wide mb-6">
            Sell on Da Shop
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            Join a growing marketplace built for Pacific vendors. Get your own storefront, reach new customers, and represent your culture.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-gold text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-gold-muted transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
