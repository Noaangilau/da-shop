import { Link } from 'react-router-dom'
import logoDark from '../assets/logo-dark.svg'

export default function Footer() {
  return (
    <footer className="bg-midnight border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <img src={logoDark} alt="DA SHOP" className="h-10 w-auto mb-4" />
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Pacific culture. All in one place. A marketplace built for Polynesian vendors and the communities that love them.
            </p>
            <Link
              to="/become-a-vendor"
              className="inline-block mt-6 bg-gold text-midnight text-xs tracking-widest uppercase font-bold px-6 py-3 hover:bg-gold-muted transition-colors duration-200"
            >
              Become a Vendor
            </Link>
          </div>

          {/* Categories */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-5">Categories</p>
            <ul className="space-y-3">
              {['Clothing', 'Jewelry', 'Food', 'Art', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-5">Vendors</p>
            <ul className="space-y-3">
              {['Frost City Tatau', "D's Fale Mā", 'ffiliku'].map((vendor) => (
                <li key={vendor}>
                  <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">
                    {vendor}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs tracking-wide">
            © 2025 DA SHOP. All rights reserved.
          </p>
          <p className="text-white/20 text-xs tracking-widest uppercase">
            Pacific Culture. All in One Place.
          </p>
        </div>
      </div>
    </footer>
  )
}
