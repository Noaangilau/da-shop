import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoDark from '../assets/logo-dark.svg'

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
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Shop
          </Link>
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Clothing
          </Link>
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Jewelry
          </Link>
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Food
          </Link>
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Art
          </Link>
          <Link to="/" className="text-white/70 hover:text-gold text-xs tracking-widest uppercase font-medium transition-colors">
            Vendors
          </Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/become-a-vendor"
            className="border border-gold text-gold text-xs tracking-widest uppercase font-bold px-5 py-2 hover:bg-gold hover:text-midnight transition-colors duration-200"
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
          {['Shop', 'Clothing', 'Jewelry', 'Food', 'Art', 'Vendors'].map((item) => (
            <Link
              key={item}
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-white/70 text-xs tracking-widest uppercase font-medium"
            >
              {item}
            </Link>
          ))}
          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="border border-gold text-gold text-xs tracking-widest uppercase font-bold px-5 py-3 text-center mt-2 hover:bg-gold hover:text-midnight transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}
