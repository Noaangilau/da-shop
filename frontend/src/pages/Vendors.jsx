import { Link } from 'react-router-dom'

const vendors = [
  {
    id: 1,
    name: 'Frost City Tatau',
    category: 'Art + Ink',
    location: 'Auckland, NZ',
    bio: 'Custom Polynesian tattoo art, flash prints, and original Pacific designs. Rooted in tradition, expressed through a modern lens.',
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
    productCount: 4,
  },
  {
    id: 2,
    name: "D's Fale Mā",
    category: 'Food + Goods',
    location: 'South Auckland, NZ',
    bio: 'Authentic Pacific island foods, seasonings, and homemade goods straight from the fale. Made with love, shared with community.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    productCount: 4,
  },
  {
    id: 3,
    name: 'ffiliku',
    category: 'Fashion',
    location: 'Wellington, NZ',
    bio: 'Contemporary island fashion rooted in Polynesian identity. Wear your culture. Designed for those who carry the Pacific wherever they go.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    productCount: 4,
  },
]

export default function Vendors() {
  return (
    <main className="pt-[88px]">

      {/* ── Header ── */}
      <section className="bg-white py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="w-12 h-px bg-midnight mb-10" />
          <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-4">
            The Marketplace
          </p>
          <h1 className="text-midnight text-4xl md:text-6xl font-black uppercase tracking-wide">
            Our Vendors
          </h1>
        </div>
      </section>

      {/* ── Vendors Grid ── */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.id}`}
                className="group bg-white"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted text-xs tracking-widest uppercase font-semibold">
                      {vendor.category}
                    </p>
                    <p className="text-muted text-xs">
                      {vendor.productCount} products
                    </p>
                  </div>
                  <h2 className="text-midnight text-xl font-black uppercase tracking-wide mb-2">
                    {vendor.name}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {vendor.bio}
                  </p>
                  <p className="text-muted text-xs tracking-widest uppercase">
                    {vendor.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-midnight py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white text-3xl font-black uppercase tracking-wide mb-4">
            Want to Sell Here?
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Apply to become a vendor and get your own storefront on DA SHOP.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-white text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-white/90 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>

    </main>
  )
}
