import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { getSchoolById } from '../data/schools'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SchoolPage() {
  const { id } = useParams()
  const school = getSchoolById(id)
  const { addToCart } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // School products will eventually come from the API. For now we show
    // a placeholder until the school's brand is set up in the admin.
    axios.get(`${API_URL}/products`)
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : []
        // Filter to products tagged for this school (by collection name matching school shortName).
        // This is a convention that the admin can use: set a product's collection to the school name.
        const schoolProducts = all.filter(
          (p) => p.collection && p.collection.toLowerCase().includes(school?.shortName?.toLowerCase() || '__none__')
        )
        setProducts(schoolProducts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, school])

  if (!school) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-10 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight font-black uppercase text-2xl mb-4">School Not Found</h1>
          <Link to="/schools" className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors">
            All Schools
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[88px] min-h-screen bg-white">

      {/* ── School Hero ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: school.colors.primary, color: school.colors.primaryInk }}
      >
        {/* diagonal stripe texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,0.07) 22px 23px)' }}
        />
        {/* secondary color bar on right */}
        <div
          className="absolute top-0 right-0 h-full w-[16%]"
          style={{ background: school.colors.secondary }}
        />
        <div className="relative max-w-[1280px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-mono mb-6 opacity-80">
            <Link to="/schools" className="hover:opacity-100 transition-opacity">Schools</Link>
            <span>/</span>
            <span className="opacity-70">{school.shortName}</span>
          </div>
          <p className="text-[12px] tracking-[0.14em] uppercase font-mono opacity-80 mb-2">
            {school.since} · Home of the {school.mascot}
          </p>
          <h1
            className="font-black uppercase leading-none"
            style={{ fontSize: 'clamp(3rem, 9vw, 9rem)', letterSpacing: '0.04em' }}
          >
            {school.name}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-white/30 max-w-2xl">
            {[
              ['ITEMS',    products.length > 0 ? products.length : '—'],
              ['LOCATION', school.location],
              ['STATUS',   school.storeOpen ? 'OPEN' : 'COMING SOON'],
              ['COLORS',   school.shortName],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] tracking-[0.2em] uppercase font-mono opacity-70 mb-1">{label}</p>
                {label === 'COLORS' ? (
                  <div className="flex gap-2 mt-1">
                    <span className="w-5 h-5 border-2 border-white/40 inline-block" style={{ background: school.colors.primary }} />
                    <span className="w-5 h-5 border-2 border-white/40 inline-block" style={{ background: school.colors.secondary }} />
                  </div>
                ) : (
                  <p className="font-bold text-sm">{val}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info strip ── */}
      <div className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['OFFICIAL SCHOOL STORE', 'Approved by the school. Each order supports school programs.'],
            ['ORDER WINDOW',          'Open year-round. Reorders ship every 2 weeks.'],
            ['SHIP TO YOU',           'Direct to your home, or pick up at the front office.'],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="text-midnight font-bold text-xs uppercase tracking-wide mb-1">{title}</p>
              <p className="text-muted text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E5E5E5]">
            {[0,1,2,3].map((i) => (
              <div key={i} className="bg-white">
                <div className="aspect-[4/5] bg-midnight/10 animate-pulse" />
                <div className="p-4 border-t border-[#E5E5E5] flex flex-col gap-2">
                  <div className="h-3 w-24 bg-midnight/10 animate-pulse" />
                  <div className="h-4 w-32 bg-midnight/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-8 h-px bg-midnight mx-auto mb-8" />
            <p className="text-midnight font-black uppercase text-lg mb-3">Products Coming Soon</p>
            <p className="text-muted text-sm leading-relaxed mb-10">
              The {school.name} store is being set up. Products will be available here soon. Sign up to be notified when the store launches.
            </p>
            <Link
              to="/"
              className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
            {products.map((product) => (
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

      {/* ── Bulk orders CTA ── */}
      <section className="bg-midnight py-16 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">Group Orders</p>
            <h2 className="text-white font-black uppercase text-2xl">Need 10+ for Your Group?</h2>
            <p className="text-white/50 text-sm leading-relaxed mt-3 max-w-md">
              Bulk pricing available for school-wide orders. Contact us for details.
            </p>
          </div>
          <Link
            to="/support"
            className="flex-shrink-0 bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-white/90 transition-colors"
          >
            Bulk Inquiry →
          </Link>
        </div>
      </section>

    </main>
  )
}
