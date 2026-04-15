import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logoLight from '../assets/logo-light.svg'
import { useCart } from '../context/CartContext'

const categoryLinks = [
  { label: 'Clothing', to: '/category/clothing' },
  { label: 'Jewelry', to: '/category/jewelry' },
  { label: 'Food', to: '/category/food' },
  { label: 'Art', to: '/category/art' },
  { label: 'Accessories', to: '/category/accessories' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">

      {/* ── Announcement Strip ── */}
      <div className="bg-midnight text-white text-center py-2 px-4">
        <p className="text-xs tracking-widest uppercase font-medium">
          Pacific Culture. All in One Place. &nbsp;·&nbsp; New vendors dropping soon
        </p>
      </div>

      {/* ── Main Nav Row ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logoLight} alt="DA SHOP" className="h-7 w-auto" />
          </Link>

          {/* Desktop — Categories */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/vendors"
              className={({ isActive }) =>
                `text-xs tracking-widest uppercase font-medium transition-colors ${
                  isActive ? 'text-midnight' : 'text-gray-400 hover:text-midnight'
                }`
              }
            >
              Vendors
            </NavLink>
            {categoryLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase font-medium transition-colors ${
                    isActive ? 'text-midnight' : 'text-gray-400 hover:text-midnight'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop — Right actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/become-a-vendor"
              className="text-xs tracking-widest uppercase font-bold text-gray-400 hover:text-midnight transition-colors"
            >
              Sell
            </Link>

            {/* Cart */}
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
                <span className="absolute -top-2 -right-2 bg-midnight text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile — Cart + Hamburger */}
          <div className="md:hidden flex items-center gap-4">
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
                <span className="absolute -top-2 -right-2 bg-midnight text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              className="p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-0.5 bg-midnight mb-1.5" />
              <div className="w-5 h-0.5 bg-midnight mb-1.5" />
              <div className="w-5 h-0.5 bg-midnight" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-4">
          <Link
            to="/vendors"
            onClick={() => setMenuOpen(false)}
            className="text-gray-500 text-xs tracking-widest uppercase font-medium hover:text-midnight transition-colors"
          >
            Vendors
          </Link>
          {categoryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-gray-500 text-xs tracking-widest uppercase font-medium hover:text-midnight transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-full h-px bg-gray-100 my-1" />
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="bg-midnight text-white text-xs tracking-widest uppercase font-bold px-5 py-3 text-center hover:bg-midnight/80 transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}
