import { Link } from 'react-router-dom'
import logoLight from '../assets/logo-dark.svg'

// ─── Footer link columns ──────────────────────────────────────────────────────
const shopLinks = [
  { label: 'Clothing',      to: '/category/clothing' },
  { label: 'Jewelry',       to: '/category/jewelry' },
  { label: 'Paintings',     to: '/category/paintings' },
  { label: 'Art Services',  to: '/category/art-services' },
  { label: 'New Arrivals',  to: '/' },
]

const brandLinks = [
  { label: 'ffiliku',           to: '/brand/1' },
  { label: 'Mana Jewelry',      to: '/brand/2' },
  { label: 'Aloha Art Studio',  to: '/brand/3' },
  { label: 'Island Ink Co.',    to: '/brand/4' },
  { label: 'All Brands',        to: '/brands' },
]

const aboutLinks = [
  { label: 'Our Story',         to: '/#culture' },
  { label: 'The Artists',       to: '/brands' },
  { label: 'Gallery',           to: '/gallery' },
  { label: 'Become a Vendor',   to: '/become-a-vendor' },
]

const supportLinks = [
  { label: 'Shipping & Returns', to: '/' },
  { label: 'Sizing Guide',       to: '/' },
  { label: 'Contact Us',         to: '/' },
  { label: 'FAQ',                to: '/' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-semibold mb-5">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-white/30 text-[11px] uppercase tracking-[0.1em] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-midnight">

      {/* ── Main footer grid ── */}
      <div className="max-w-[1280px] mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand — spans 1 col */}
          <div className="md:col-span-1">
            <img src={logoLight} alt="DA SHOP" className="h-7 w-auto mb-5" />
            <p className="text-white/25 text-xs leading-relaxed max-w-[200px]">
              Pacific culture. All in one place.
            </p>
          </div>

          {/* Link columns — span 4 cols */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-10">
            <FooterColumn title="Shop" links={shopLinks} />
            <FooterColumn title="Brands" links={brandLinks} />
            <FooterColumn title="About" links={aboutLinks} />
            <FooterColumn title="Support" links={supportLinks} />
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/15 text-[10px] tracking-[0.15em] uppercase">
            © DA SHOP. Pacific Culture. All in One Place.
          </p>
          <p className="text-white/10 text-[10px] tracking-[0.1em] uppercase">
            Built for the Community
          </p>
        </div>
      </div>

    </footer>
  )
}
