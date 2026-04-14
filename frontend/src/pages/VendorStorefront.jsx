import { Link, useParams } from 'react-router-dom'

// ─── Demo Data ────────────────────────────────────────────────────────────────

const vendorData = {
  1: {
    id: 1,
    name: 'Frost City Tatau',
    category: 'Art + Ink',
    location: 'Auckland, NZ',
    bio: 'Custom Polynesian tattoo art, flash prints, and original Pacific designs. Rooted in tradition, expressed through a modern lens. Every piece tells a story of identity, ancestry, and pride.',
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=400&q=80',
    instagram: '@frostcitytatau',
    products: [
      { id: 1, name: 'Custom Tatau Flash Sheet', price: 85, category: 'Art', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80' },
      { id: 2, name: "Sāmoan Pe'a Art Print", price: 45, category: 'Art', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80' },
      { id: 7, name: 'Pacific Motif Sticker Set', price: 18, category: 'Art', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=80' },
      { id: 8, name: 'Tatau Reference Book', price: 55, category: 'Art', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  2: {
    id: 2,
    name: "D's Fale Mā",
    category: 'Food + Goods',
    location: 'South Auckland, NZ',
    bio: 'Authentic Pacific island foods, seasonings, and homemade goods straight from the fale. Made with love, shared with community. Every product carries the flavors of home.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    instagram: '@dsfaelema',
    products: [
      { id: 3, name: 'Taro & Coconut Cream Bread', price: 12, category: 'Food', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
      { id: 4, name: 'Oka Ika Seasoning Pack', price: 28, category: 'Food', image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=600&q=80' },
      { id: 9, name: 'Coconut Caramel Sauce', price: 16, category: 'Food', image: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&fit=crop&w=600&q=80' },
      { id: 10, name: 'Island Spice Bundle', price: 38, category: 'Food', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  3: {
    id: 3,
    name: 'ffiliku',
    category: 'Fashion',
    location: 'Wellington, NZ',
    bio: 'Contemporary island fashion rooted in Polynesian identity. Wear your culture. Each piece is designed to bridge heritage and modern life — for those who carry the Pacific wherever they go.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    instagram: '@ffiliku',
    products: [
      { id: 5, name: 'Island Linen Tapa Shirt', price: 120, category: 'Clothing', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
      { id: 6, name: 'Vā Collection Tote', price: 65, category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
      { id: 11, name: 'Moana Linen Trousers', price: 95, category: 'Clothing', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80' },
      { id: 12, name: 'Pacific Print Bucket Hat', price: 48, category: 'Accessories', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=600&q=80' },
    ],
  },
}

// ─── Vendor Storefront Page ───────────────────────────────────────────────────

export default function VendorStorefront() {
  const { id } = useParams()
  const vendor = vendorData[id]

  if (!vendor) {
    return (
      <main className="pt-16 min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4">404</p>
          <h1 className="text-white text-3xl font-black uppercase mb-6">Vendor Not Found</h1>
          <Link to="/" className="bg-white text-midnight text-xs tracking-widest uppercase font-bold px-8 py-3 inline-block hover:bg-white/90 transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16">

      {/* ── Vendor Hero ── */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-midnight/70" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-10 w-full">
            <p className="text-white/50 text-xs tracking-widest uppercase font-semibold mb-2">
              {vendor.category}
            </p>
            <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-wide">
              {vendor.name}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Vendor Info ── */}
      <section className="bg-midnight border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1">
            <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{vendor.location}</p>
            <p className="text-white/70 text-base leading-relaxed max-w-xl mt-3">
              {vendor.bio}
            </p>
            {vendor.instagram && (
              <p className="text-white/40 text-sm mt-4 tracking-wide">{vendor.instagram}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-4 text-white/40 text-xs tracking-widest uppercase">
              <span>{vendor.products.length} Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-midnight/40 text-xs tracking-widest uppercase font-semibold mb-2">
              All Products
            </p>
            <h2 className="text-midnight text-3xl font-black uppercase tracking-wide">
              {vendor.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {vendor.products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
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
                <div className="p-5">
                  <h3 className="text-midnight font-bold text-sm mb-2 leading-snug">
                    {product.name}
                  </h3>
                  <span className="text-midnight font-black text-lg">
                    ${product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-midnight py-20 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase font-semibold mb-4">
            Are you a Pacific vendor?
          </p>
          <h2 className="text-white text-3xl font-black uppercase tracking-wide mb-6">
            Sell on Da Shop
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            Get your own storefront, reach new customers, and represent your culture.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-white text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-white/90 transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
