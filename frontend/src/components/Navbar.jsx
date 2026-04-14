import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoLight from '../assets/logo-light.svg'

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logoLight} alt="DA SHOP" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-gray-500 hover:text-midnight text-xs tracking-widest uppercase font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/become-a-vendor"
            className="bg-midnight text-white text-xs tracking-widest uppercase font-bold px-5 py-2.5 hover:bg-midnight/80 transition-colors duration-200"
          >
            Become a Vendor
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-midnight mb-1.5" />
          <div className="w-6 h-0.5 bg-midnight mb-1.5" />
          <div className="w-6 h-0.5 bg-midnight" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-gray-500 text-xs tracking-widest uppercase font-medium hover:text-midnight transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="bg-midnight text-white text-xs tracking-widest uppercase font-bold px-5 py-3 text-center mt-2 hover:bg-midnight/80 transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}
