import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logoLight from '../assets/logo-light.svg'
import { useCart } from '../context/CartContext'

// ─── Nav category links ───────────────────────────────────────────────────────
const categoryLinks = [
  { label: 'Clothing',     to: '/category/clothing' },
  { label: 'Jewelry',      to: '/category/jewelry' },
  { label: 'Paintings',    to: '/category/paintings' },
  { label: 'Art Services', to: '/category/art-services' },
  { label: 'Brands',       to: '/brands' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()

  // Add border on scroll (Pro Club / Lucid Blanks pattern)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">

      {/* ── Announcement Strip ── */}
      <div className="bg-midnight">
        <p className="text-white text-[11px] tracking-[0.12em] uppercase text-center py-2 px-4 font-medium">
          Free shipping on orders over $150 &nbsp;·&nbsp; New drops every week
        </p>
      </div>

      {/* ── Main Nav Row ── */}
      <div className={`transition-all duration-200 ${scrolled ? 'border-b border-[#E5E5E5]' : 'border-b border-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-14">

          {/* Logo — left */}
          <Link to="/" className="flex-shrink-0">
            <img src={logoLight} alt="DA SHOP" className="h-7 w-auto" />
          </Link>

          {/* Category links — center (desktop) */}
          <div className="hidden lg:flex items-center gap-7">
            {categoryLinks.map((link) => (
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

          {/* Right actions — cart + become a vendor (desktop) */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              to="/become-a-vendor"
              className="text-[11px] tracking-[0.12em] uppercase font-medium text-muted hover:text-midnight transition-colors"
            >
              Sell
            </Link>

            {/* Cart icon */}
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
          </div>

          {/* Mobile — cart + hamburger */}
          <div className="lg:hidden flex items-center gap-4">
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
        <div className="lg:hidden bg-white border-t border-[#E5E5E5] px-6 py-6 flex flex-col gap-4">
          {categoryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-muted text-[11px] tracking-[0.12em] uppercase font-medium hover:text-midnight transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-full h-px bg-[#E5E5E5] my-1" />
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="bg-midnight text-white text-[11px] tracking-[0.12em] uppercase font-bold px-5 py-3 text-center hover:bg-midnight/80 transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}
