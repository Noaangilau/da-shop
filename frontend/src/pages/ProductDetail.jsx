import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

// ─── Demo Data ────────────────────────────────────────────────────────────────

const productData = {
  1: {
    id: 1,
    name: 'Custom Tatau Flash Sheet',
    vendor: 'Frost City Tatau',
    vendorId: 1,
    price: 85,
    category: 'Art',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1200&q=80',
    description: 'A hand-drawn collection of Polynesian tatau motifs, ready for custom adaptation. Each sheet includes 12 original designs rooted in Pacific symbolism — perfect for tattoo collectors, artists, and anyone who wants to carry the culture.',
    details: ['Digital download — high-resolution PDF', 'Print-ready at A3 size', 'Includes artist usage license'],
  },
  2: {
    id: 2,
    name: "Sāmoan Pe'a Art Print",
    vendor: 'Frost City Tatau',
    vendorId: 1,
    price: 45,
    category: 'Art',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    description: "A detailed fine-art print depicting the traditional Sāmoan pe'a in its full form. Rendered in archival ink on 300gsm cotton paper. A powerful statement piece for any home or studio.",
    details: ['A2 fine-art print', '300gsm archival cotton paper', 'Ships flat in protective sleeve'],
  },
  3: {
    id: 3,
    name: 'Taro & Coconut Cream Bread',
    vendor: "D's Fale Mā",
    vendorId: 2,
    price: 12,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    description: 'Homemade Pacific bread baked fresh with taro and real coconut cream. Soft, dense, and fragrant — the kind of bread that takes you straight back to the islands. Order by Friday for weekend pickup.',
    details: ['Freshly baked to order', 'No preservatives', 'Pickup available — Auckland South'],
  },
  4: {
    id: 4,
    name: 'Oka Ika Seasoning Pack',
    vendor: "D's Fale Mā",
    vendorId: 2,
    price: 28,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1200&q=80',
    description: "Everything you need to make authentic oka ika at home. A curated blend of Pacific seasonings, dried herbs, and the house spice mix from D's kitchen. Ships nationwide.",
    details: ['4-piece seasoning kit', 'Includes recipe card', 'Ships within 2 business days'],
  },
  5: {
    id: 5,
    name: 'Island Linen Tapa Shirt',
    vendor: 'ffiliku',
    vendorId: 3,
    price: 120,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
    description: 'Cut from premium linen with a subtle tapa-inspired print, this shirt is designed to be worn everywhere — from the office to the umu. Relaxed fit, boxy silhouette, zero compromise.',
    details: ['100% linen', 'Sizes XS–3XL', 'Machine washable', 'Ships within 3–5 days'],
  },
  6: {
    id: 6,
    name: 'Vā Collection Tote',
    vendor: 'ffiliku',
    vendorId: 3,
    price: 65,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
    description: "Named after the Sāmoan concept of relational space, the Vā tote is heavy-duty canvas with hand-printed Pacific motifs. Carry your culture, literally.",
    details: ['Heavy-duty canvas', 'Hand-printed design', 'Reinforced straps', 'One size'],
  },
}

// ─── Product Detail Page ──────────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams()
  const product = productData[id]
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return (
      <main className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted text-xs tracking-widest uppercase mb-4">404</p>
          <h1 className="text-midnight text-3xl font-black uppercase mb-6 tracking-wide">Product Not Found</h1>
          <Link to="/" className="bg-midnight text-white text-xs tracking-widest uppercase font-bold px-8 py-3.5 inline-block hover:bg-midnight/80 transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-xs tracking-widest uppercase text-muted">
          <Link to="/" className="hover:text-midnight transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/vendor/${product.vendorId}`} className="hover:text-midnight transition-colors">{product.vendor}</Link>
          <span>/</span>
          <span className="text-midnight">{product.name}</span>
        </div>
      </div>

      {/* ── Product Layout ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Image */}
          <div className="relative overflow-hidden bg-sand">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white text-midnight text-xs font-bold tracking-widest uppercase px-2.5 py-1">
                {product.category}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-7">

            {/* Vendor */}
            <Link
              to={`/vendor/${product.vendorId}`}
              className="text-muted text-xs tracking-widest uppercase font-semibold hover:text-midnight transition-colors"
            >
              {product.vendor} →
            </Link>

            {/* Name + Price */}
            <div>
              <h1 className="text-midnight text-3xl md:text-4xl font-black uppercase tracking-wide leading-tight mb-5">
                {product.name}
              </h1>
              <p className="text-midnight font-black text-2xl">
                ${product.price}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100" />

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Details */}
            <ul className="flex flex-col gap-2.5">
              {product.details.map((detail, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-gray-500 uppercase tracking-wide">
                  <div className="w-1 h-1 bg-muted rounded-full flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`font-black text-xs tracking-widest uppercase px-10 py-4 transition-colors duration-200 flex-1 ${
                  added
                    ? 'bg-gray-100 text-midnight border border-gray-200'
                    : 'bg-midnight text-white hover:bg-midnight/80'
                }`}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              <Link
                to={`/vendor/${product.vendorId}`}
                className="border border-gray-200 text-midnight font-black text-xs tracking-widest uppercase px-8 py-4 hover:border-midnight transition-colors duration-200 text-center"
              >
                Visit Store
              </Link>
            </div>

            {/* Sold by */}
            <div className="border border-gray-100 bg-sand p-5">
              <p className="text-muted text-xs tracking-widest uppercase mb-2">Sold by</p>
              <Link
                to={`/vendor/${product.vendorId}`}
                className="text-midnight font-black text-sm uppercase tracking-wide hover:text-muted transition-colors"
              >
                {product.vendor}
              </Link>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
