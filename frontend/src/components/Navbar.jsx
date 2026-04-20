import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import axios from 'axios'
import logoLight from '../assets/logo-light.svg'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Clothing subcategories ───────────────────────────────────────────────────
const clothingSubcategories = [
  { label: 'New Arrivals',  sub: 'new' },
  { label: 'T-Shirts',      sub: 't-shirts' },
  { label: 'Shirts',        sub: 'shirts' },
  { label: 'Fleece',        sub: 'fleece' },
  { label: 'Outerwear',     sub: 'outerwear' },
  { label: 'Denim',         sub: 'denim' },
  { label: 'Bottoms',       sub: 'bottoms' },
  { label: 'Footwear',      sub: 'footwear' },
  { label: 'Men',           sub: 'men' },
  { label: 'Women',         sub: 'women' },
  { label: 'Accessories',   sub: 'accessories' },
]

// ─── Other nav links ──────────────────────────────────────────────────────────
const otherLinks = [
  { label: 'Jewelry',      to: '/category/jewelry' },
  { label: 'Paintings',    to: '/category/paintings' },
  { label: 'Art Services', to: '/category/art-services' },
  { label: 'Brands',       to: '/brands' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [clothingOpen, setClothingOpen] = useState(false)
  const [mobileClothingOpen, setMobileClothingOpen] = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [banner, setBanner]           = useState(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const { totalItems } = useCart()
  const { customer, logout } = useAuth()
  const closeTimerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    axios.get(`${API_URL}/announcements/active`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        const b = data.find((a) => a.display_mode === 'banner' || a.display_mode === 'both')
        if (b && !localStorage.getItem(`ann-dismissed-${b.id}`)) setBanner(b)
      })
      .catch(() => {})
  }, [])

  function dismissBanner() {
    if (banner) localStorage.setItem(`ann-dismissed-${banner.id}`, '1')
    setBannerDismissed(true)
  }

  function openClothing() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setClothingOpen(true)
  }

  function closeClothing() {
    closeTimerRef.current = setTimeout(() => setClothingOpen(false), 180)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">

      {/* ── Announcement Strip ── */}
      {banner && !bannerDismissed ? (
        <div className="bg-midnight relative">
          <p className="text-white text-[11px] tracking-[0.12em] uppercase text-center py-2 px-10 font-medium">
            {banner.title}
            {banner.cta_url && (
              <a href={banner.cta_url} className="underline ml-2 hover:text-white/80">
                {banner.cta_label || 'Learn more'}
              </a>
            )}
          </p>
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="bg-midnight">
          <p className="text-white text-[11px] tracking-[0.12em] uppercase text-center py-2 px-4 font-medium">
            Free shipping on orders over $150 &nbsp;·&nbsp; New drops every week
          </p>
        </div>
      )}

      {/* ── Main Nav Row ── */}
      <div className={`transition-all duration-200 ${scrolled ? 'border-b border-[#E5E5E5]' : 'border-b border-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logoLight} alt="DA SHOP" className="h-7 w-auto" />
          </Link>

          {/* Desktop category links */}
          <div className="hidden lg:flex items-center gap-7">

            {/* Clothing — with hover dropdown */}
            <div
              className="relative"
              onMouseEnter={openClothing}
              onMouseLeave={closeClothing}
            >
              <NavLink
                to="/category/clothing"
                className={({ isActive }) =>
                  `text-[11px] tracking-[0.12em] uppercase font-medium transition-colors ${
                    isActive || clothingOpen ? 'text-midnight' : 'text-muted hover:text-midnight'
                  }`
                }
              >
                Clothing
              </NavLink>

              {/* Dropdown */}
              {clothingOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                  <div className="bg-white border border-[#E5E5E5] shadow-sm py-3 w-44">
                    <Link
                      to="/category/clothing"
                      onClick={() => setClothingOpen(false)}
                      className="block px-5 py-1.5 text-[11px] tracking-[0.1em] uppercase font-black text-midnight hover:bg-[#F7F7F7] transition-colors"
                    >
                      All Clothing
                    </Link>
                    <div className="w-full h-px bg-[#E5E5E5] my-2" />
                    {clothingSubcategories.map((item) => (
                      <Link
                        key={item.sub}
                        to={`/category/clothing?sub=${item.sub}`}
                        onClick={() => setClothingOpen(false)}
                        className="block px-5 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium text-muted hover:text-midnight hover:bg-[#F7F7F7] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Other links */}
            {otherLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-[11px] tracking-[0.12em] uppercase font-medium transition-colors ${
                    isActive ? 'text-midnight' : 'text-muted hover:text-midnight'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop right — Account + Sell + Cart */}
          <div className="hidden lg:flex items-center gap-5">
            {customer ? (
              <>
                {customer.is_admin && (
                  <Link to="/admin" className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors">
                    Admin
                  </Link>
                )}
                {customer.role === 'vendor' && customer.brand_id && (
                  <Link to="/vendor" className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors">
                    Vendor
                  </Link>
                )}
                <Link to="/profile" className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors">
                  {customer.first_name}
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors">
                Sign In
              </Link>
            )}
            <Link
              to="/become-a-vendor"
              className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors"
            >
              Sell
            </Link>
            <CartIcon totalItems={totalItems} />
          </div>

          {/* Mobile — cart + hamburger */}
          <div className="lg:hidden flex items-center gap-4">
            <CartIcon totalItems={totalItems} />
            <button
              className="p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`w-5 h-[1.5px] bg-midnight transition-all ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-midnight my-[4px] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-midnight transition-all ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E5E5] px-6 py-6 flex flex-col gap-1">

          {/* Clothing — expandable */}
          <div>
            <button
              onClick={() => setMobileClothingOpen(!mobileClothingOpen)}
              className="w-full flex items-center justify-between py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors"
            >
              Clothing
              <span className="text-lg leading-none">{mobileClothingOpen ? '−' : '+'}</span>
            </button>
            {mobileClothingOpen && (
              <div className="pl-4 flex flex-col gap-0.5 pb-2">
                <Link
                  to="/category/clothing"
                  onClick={() => setMenuOpen(false)}
                  className="py-1.5 text-midnight text-[11px] tracking-[0.1em] uppercase font-black hover:text-muted transition-colors"
                >
                  All Clothing
                </Link>
                {clothingSubcategories.map((item) => (
                  <Link
                    key={item.sub}
                    to={`/category/clothing?sub=${item.sub}`}
                    onClick={() => setMenuOpen(false)}
                    className="py-1.5 text-muted text-[11px] tracking-[0.1em] uppercase font-medium hover:text-midnight transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Other links */}
          {otherLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="w-full h-px bg-[#E5E5E5] my-2" />
          {customer ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors">
                My Account ({customer.first_name})
              </Link>
              {customer.is_admin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors">
                  Admin Dashboard
                </Link>
              )}
              {customer.role === 'vendor' && customer.brand_id && (
                <Link to="/vendor" onClick={() => setMenuOpen(false)} className="py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors">
                  Vendor Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors">
              Sign In / Create Account
            </Link>
          )}
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="bg-midnight text-white text-[11px] tracking-[0.12em] uppercase font-bold px-5 py-3 text-center hover:bg-midnight/80 transition-colors mt-2"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}

// ─── Shared cart icon ─────────────────────────────────────────────────────────
function CartIcon({ totalItems }) {
  return (
    <Link to="/cart" className="relative flex items-center" aria-label="Cart">
      <svg
        className="w-5 h-5 text-midnight"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-midnight text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
