import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ProductSkeleton() {
  return (
    <div className="bg-white">
      <div className="aspect-[4/5] bg-midnight/10 animate-pulse" />
      <div className="p-4 border-t border-[#E5E5E5] flex flex-col gap-2">
        <div className="h-2.5 w-16 bg-midnight/10 animate-pulse" />
        <div className="h-4 w-full bg-midnight/10 animate-pulse" />
        <div className="h-3.5 w-12 bg-midnight/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function BrandPage() {
  const { id } = useParams()
  const [brand, setBrand]       = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [activeCollection, setActiveCollection] = useState('All')

  useEffect(() => {
    const brandReq    = axios.get(`${API_URL}/brands/${id}`)
    const productsReq = axios.get(`${API_URL}/brands/${id}/products`)

    Promise.all([brandReq, productsReq])
      .then(([brandRes, productsRes]) => {
        setBrand(brandRes.data)
        setProducts(productsRes.data)
      })
      .catch((err) => {
        if (err.response?.status === 404) setBrand(null)
        else setError(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const forSale  = products.filter((p) => p.type === 'product')
  const services = products.filter((p) => p.type === 'service')

  // Derive unique collections for tab nav
  const collections = useMemo(() => {
    const cols = [...new Set(forSale.map((p) => p.collection).filter(Boolean))]
    return cols.length > 1 ? ['All', ...cols] : []
  }, [forSale])

  const visibleProducts = useMemo(() => {
    if (activeCollection === 'All') return forSale
    return forSale.filter((p) => p.collection === activeCollection)
  }, [forSale, activeCollection])

  if (!loading && !error && brand === null) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase mb-4">404</p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-6">Brand Not Found</h1>
          <Link
            to="/brands"
            className="bg-midnight text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 inline-block hover:bg-midnight/80 transition-colors"
          >
            All Brands
          </Link>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted text-sm uppercase tracking-widest">Something went wrong. Try refreshing.</p>
      </main>
    )
  }

  return (
    <main className="pt-[88px]">

      {/* ── Brand hero ── */}
      <section className="relative h-[28rem] md:h-[36rem] overflow-hidden bg-midnight">
        {brand?.hero_image_url && (
          <img
            src={brand.hero_image_url}
            alt={brand?.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/55" />

        {/* Bottom-left: logo + brand name */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1280px] mx-auto px-6 pb-12 w-full">
            {loading ? (
              <>
                <div className="h-3 w-24 bg-white/20 animate-pulse mb-3" />
                <div className="h-12 w-80 bg-white/20 animate-pulse" />
              </>
            ) : (
              <>
                {/* White logo above name if available */}
                {brand.logo_white_url && (
                  <img
                    src={brand.logo_white_url}
                    alt={brand.name}
                    className="h-10 w-auto mb-5 object-contain object-left"
                  />
                )}
                <p className="text-white/50 text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
                  {brand.category}
                </p>
                <h1
                  className="text-white font-black uppercase"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em' }}
                >
                  {brand.name}
                </h1>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Brand info strip ── */}
      <section className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10 items-start">
          {loading ? (
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-3 w-32 bg-midnight/10 animate-pulse" />
              <div className="h-4 w-64 bg-midnight/10 animate-pulse" />
              <div className="h-3 w-full bg-midnight/10 animate-pulse" />
              <div className="h-3 w-3/4 bg-midnight/10 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-muted text-[10px] tracking-[0.2em] uppercase mb-3">{brand.location}</p>
                <p className="text-[15px] italic text-muted mb-4">"{brand.tagline}"</p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{brand.bio}</p>
                {brand.instagram && (
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase mt-5">{brand.instagram}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 text-muted text-[10px] tracking-[0.15em] uppercase text-right">
                <span>{forSale.length} Products</span>
                {services.length > 0 && <span>{services.length} Services</span>}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Products grid ── */}
      <section className="bg-[#F7F7F7] py-20 px-6">
        <div className="max-w-[1280px] mx-auto">

          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">All Products</p>
              <h2 className="text-midnight font-black uppercase tracking-wide text-2xl">
                {loading ? 'Loading...' : `Shop ${brand.name}`}
              </h2>
            </div>

            {/* Collections tabs */}
            {!loading && collections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => (
                  <button
                    key={col}
                    onClick={() => setActiveCollection(col)}
                    className={`text-[11px] tracking-[0.12em] uppercase font-bold px-5 py-2 border transition-colors duration-150 ${
                      activeCollection === col
                        ? 'bg-midnight text-white border-midnight'
                        : 'bg-white text-muted border-[#E5E5E5] hover:border-midnight hover:text-midnight'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E5E5E5]">
            {loading
              ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ProductSkeleton key={i} />)
              : visibleProducts.length === 0
              ? (
                <div className="col-span-full py-20 text-center bg-white">
                  <p className="text-muted text-sm uppercase tracking-widest">No products in this collection.</p>
                </div>
              )
              : visibleProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group bg-white">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.collection && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-midnight text-white text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1">
                            {product.collection}
                          </span>
                        </div>
                      )}
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
        </div>
      </section>

      {/* ── Art Services section ── */}
      {!loading && services.length > 0 && (
        <section className="bg-white py-20 px-6 border-t border-[#E5E5E5]">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-10">
              <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">Custom Work</p>
              <h2 className="text-midnight font-black uppercase tracking-wide text-2xl">Art Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E5E5]">
              {services.map((service) => (
                <Link key={service.id} to={`/product/${service.id}`} className="group bg-white overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-300" />
                  </div>
                  <div className="p-6 border-t border-[#E5E5E5]">
                    <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Art Service</p>
                    <h3 className="text-midnight font-black uppercase tracking-wide text-base mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">{service.description?.substring(0, 100)}...</p>
                    <p className="text-midnight font-bold text-sm">From ${service.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA banner ── */}
      <section className="bg-midnight py-20 px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-semibold mb-4">Are you a Pacific vendor?</p>
          <h2
            className="text-white font-black uppercase mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
          >
            Sell on DA SHOP
          </h2>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-white text-midnight font-black text-[11px] tracking-[0.15em] uppercase px-12 py-4 hover:bg-white/90 transition-colors duration-200"
          >
            Apply to Sell
          </Link>
        </div>
      </section>

    </main>
  )
}
