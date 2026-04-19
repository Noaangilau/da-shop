import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Brand Directory — /brands ────────────────────────────────────────────────

function BrandCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="h-72 bg-midnight/10 animate-pulse" />
      <div className="p-8 border-t border-[#E5E5E5] flex flex-col gap-3">
        <div className="h-3 w-20 bg-midnight/10 animate-pulse" />
        <div className="h-6 w-48 bg-midnight/10 animate-pulse" />
        <div className="h-3 w-full bg-midnight/10 animate-pulse" />
        <div className="h-3 w-3/4 bg-midnight/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function Brands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/brands`)
      .then((res) => setBrands(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="pt-[88px]">

      {/* ── Page header ── */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="w-10 h-px bg-midnight mb-10" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">
            The Marketplace
          </p>
          <h1
            className="text-midnight font-black uppercase"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em' }}
          >
            The Brands
          </h1>
          <p className="text-muted text-sm mt-5 max-w-lg leading-relaxed">
            Independent Pacific brands, one platform. Each with their own story, their own craft, and their own community.
          </p>
        </div>
      </section>

      {/* ── Brands grid ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-[1280px] mx-auto">

          {error ? (
            <div className="py-24 text-center bg-white">
              <p className="text-muted text-sm uppercase tracking-widest">
                Something went wrong. Try refreshing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E5E5E5]">
              {loading
                ? [0, 1].map((i) => <BrandCardSkeleton key={i} />)
                : brands.map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/brand/${brand.id}`}
                      className="group bg-white overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative h-72 overflow-hidden">
                        <img
                          src={brand.card_image_url}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>

                      {/* Brand info */}
                      <div className="p-8 border-t border-[#E5E5E5]">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">
                              {brand.category}
                            </p>
                            <h2 className="text-midnight font-black uppercase tracking-wide text-2xl">
                              {brand.name}
                            </h2>
                          </div>
                          <span className="text-muted text-[10px] tracking-[0.1em] uppercase flex-shrink-0 mt-1">
                            {brand.location}
                          </span>
                        </div>

                        <p className="text-[13px] italic text-muted mb-3">
                          "{brand.tagline}"
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                          {brand.bio}
                        </p>

                        <div className="flex items-center justify-end">
                          <span className="text-midnight font-black text-[11px] tracking-[0.15em] uppercase group-hover:text-muted transition-colors">
                            Shop Brand →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Become a vendor CTA ── */}
      <section className="bg-midnight py-20 px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-semibold mb-4">
            Pacific vendors
          </p>
          <h2
            className="text-white font-black uppercase mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em' }}
          >
            Want to Sell Here?
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-12 max-w-md mx-auto">
            Apply to become a vendor and get your own branded storefront on DA SHOP.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-12 py-4 hover:bg-white/90 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>

    </main>
  )
}
