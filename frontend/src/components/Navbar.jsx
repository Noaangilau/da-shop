import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoDark from '../assets/logo-dark.svg'

const navLinks = [
  { label: 'Shop', to: '/#products' },
  { label: 'Clothing', to: '/?category=Clothing' },
  { label: 'Jewelry', to: '/?category=Jewelry' },
  { label: 'Food', to: '/?category=Food' },
  { label: 'Art', to: '/?category=Art' },
  { label: 'Vendors', to: '/vendors' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logoDark} alt="DA SHOP" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-white/70 hover:text-white text-xs tracking-widest uppercase font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/become-a-vendor"
            className="border border-white text-white text-xs tracking-widest uppercase font-bold px-5 py-2 hover:bg-white hover:text-midnight transition-colors duration-200"
          >
            Become a Vendor
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-white mb-1.5" />
          <div className="w-6 h-0.5 bg-white mb-1.5" />
          <div className="w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-midnight border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-white/70 text-xs tracking-widest uppercase font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="border border-white text-white text-xs tracking-widest uppercase font-bold px-5 py-3 text-center mt-2 hover:bg-white hover:text-midnight transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}
