import { Link } from 'react-router-dom'

// ─── Editorial Gallery / Lookbook — /gallery ─────────────────────────────────
// Showcases DA SHOP's brands and culture through editorial imagery.

const editorialImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    brand: 'ffiliku',
    brandId: 1,
    caption: 'Island Linen — SS25',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    brand: 'Mana Jewelry',
    brandId: 2,
    caption: 'Shell Collection',
    span: '',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=600&q=80',
    brand: 'Island Ink Co.',
    brandId: 4,
    caption: 'Tatau Works',
    span: '',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
    brand: 'Aloha Art Studio',
    brandId: 3,
    caption: 'Pacific Series',
    span: '',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    brand: 'ffiliku',
    brandId: 1,
    caption: 'Tapa Collection',
    span: '',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=800&q=80',
    brand: 'Aloha Art Studio',
    brandId: 3,
    caption: 'Pacific Ancestors',
    span: 'md:col-span-2',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94791c4?auto=format&fit=crop&w=600&q=80',
    brand: 'Mana Jewelry',
    brandId: 2,
    caption: 'Gold-Plated Series',
    span: '',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80',
    brand: 'Island Ink Co.',
    brandId: 4,
    caption: 'Flash Sheets',
    span: '',
  },
]

export default function Gallery() {
  return (
    <main className="pt-[88px]">

      {/* ── Header ── */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="w-10 h-px bg-midnight mb-10" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">
            Our World
          </p>
          <h1
            className="text-midnight font-black uppercase"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em' }}
          >
            The Gallery
          </h1>
          <p className="text-muted text-sm mt-5 max-w-lg leading-relaxed">
            An editorial look at the brands, products, and culture behind DA SHOP. Pacific identity, expressed through craft.
          </p>
        </div>
      </section>

      {/* ── Editorial grid ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5] auto-rows-[280px]">
            {editorialImages.map((item) => (
              <Link
                key={item.id}
                to={`/brand/${item.brandId}`}
                className={`group relative overflow-hidden bg-white ${item.span}`}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-1">{item.brand}</p>
                  <p className="text-white font-black text-xs uppercase tracking-[0.1em]">{item.caption}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-midnight py-20 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2
              className="text-white font-black uppercase"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '0.04em' }}
            >
              Shop the Brands
            </h2>
            <p className="text-white/40 text-sm mt-3">
              Every image in this gallery links to the brand behind it.
            </p>
          </div>
          <Link
            to="/brands"
            className="flex-shrink-0 bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-white/90 transition-colors"
          >
            All Brands →
          </Link>
        </div>
      </section>

    </main>
  )
}
