import { Link } from 'react-router-dom'
import logoLight from '../assets/logo-dark.svg'

const categories = [
  { label: 'Clothing', slug: 'clothing' },
  { label: 'Jewelry', slug: 'jewelry' },
  { label: 'Food', slug: 'food' },
  { label: 'Art', slug: 'art' },
  { label: 'Accessories', slug: 'accessories' },
]

const vendors = [
  { name: 'Frost City Tatau', id: 1 },
  { name: "D's Fale Mā", id: 2 },
  { name: 'ffiliku', id: 3 },
]

export default function Footer() {
  return (
    <footer className="bg-midnight border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <img src={logoLight} alt="DA SHOP" className="h-8 w-auto mb-5" />
            <p className="text-white/30 text-xs leading-relaxed max-w-xs">
              Pacific culture. All in one place. A marketplace built for Polynesian vendors and the communities that love them.
            </p>
            <Link
              to="/become-a-vendor"
              className="inline-block mt-7 bg-white text-midnight text-xs tracking-widest uppercase font-bold px-6 py-3 hover:bg-white/90 transition-colors duration-200"
            >
              Become a Vendor
            </Link>
          </div>

          {/* Categories */}
          <div>
            <p className="text-white/20 text-[10px] tracking-widest uppercase font-semibold mb-5">Categories</p>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-white/30 hover:text-white text-sm transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <p className="text-white/20 text-[10px] tracking-widest uppercase font-semibold mb-5">Vendors</p>
            <ul className="space-y-3">
              {vendors.map((vendor) => (
                <li key={vendor.id}>
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className="text-white/30 hover:text-white text-sm transition-colors"
                  >
                    {vendor.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/15 text-xs tracking-wide">
            © 2025 DA SHOP. All rights reserved.
          </p>
          <p className="text-white/10 text-[10px] tracking-widest uppercase">
            Pacific Culture. All in One Place.
          </p>
        </div>
      </div>
    </footer>
  )
}
