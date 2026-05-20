import { Link } from 'react-router-dom'
import logoLight from '../assets/logo-dark.svg'

const shopLinks = [
  { label: 'All Clothing',  to: '/category/clothing' },
  { label: 'Tees',          to: '/category/clothing?sub=t-shirts' },
  { label: 'Long Sleeves',  to: '/category/clothing?sub=long-sleeves' },
  { label: 'Crew Necks',    to: '/category/clothing?sub=crew-necks' },
  { label: 'Hoodies',       to: '/category/clothing?sub=hoodies' },
]

const schoolLinks = [
  { label: 'All Schools',    to: '/schools' },
  { label: 'West High',      to: '/school/west-high' },
  { label: 'Apply a School', to: '/become-a-vendor' },
]

const aboutLinks = [
  { label: 'Our Brands',       to: '/brands' },
  { label: 'Become a Vendor',  to: '/become-a-vendor' },
  { label: 'Gallery',          to: '/gallery' },
]

const supportLinks = [
  { label: 'Support & FAQ',  to: '/support' },
  { label: 'Shipping Info',  to: '/shipping' },
  { label: 'Returns Policy', to: '/returns' },
  { label: 'Terms',          to: '/terms' },
  { label: 'Privacy',        to: '/privacy' },
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
      <div className="max-w-[1280px] mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          <div className="md:col-span-1">
            <img src={logoLight} alt="DA SHOP" className="h-7 w-auto mb-5" />
            <p className="text-white/25 text-xs leading-relaxed max-w-[200px]">
              A multi-brand catalog of basics.
            </p>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-10">
            <FooterColumn title="Shop"    links={shopLinks} />
            <FooterColumn title="Schools" links={schoolLinks} />
            <FooterColumn title="About"   links={aboutLinks} />
            <FooterColumn title="Support" links={supportLinks} />
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/15 text-[10px] tracking-[0.15em] uppercase">
            © DA SHOP. All Rights Reserved.
          </p>
          <p className="text-white/10 text-[10px] tracking-[0.1em] uppercase">
            Built for the Community
          </p>
        </div>
      </div>
    </footer>
  )
}
