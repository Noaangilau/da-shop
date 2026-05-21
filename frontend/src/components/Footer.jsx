import { useState } from 'react'
import { Link } from 'react-router-dom'

const shopLinks = [
  { label: 'All Clothing',  to: '/category/clothing' },
  { label: 'Tees',          to: '/category/clothing?sub=t-shirts' },
  { label: 'Long Sleeves',  to: '/category/clothing?sub=long-sleeves' },
  { label: 'Crew Necks',    to: '/category/clothing?sub=crew-necks' },
  { label: 'Hoodies',       to: '/category/clothing?sub=hoodies' },
]

const schoolLinks = [
  { label: 'All Schools', to: '/schools' },
  { label: 'West High',   to: '/school/west-high' },
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
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-paper/40 font-medium mb-5">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="font-mono text-[12px] tracking-[0.04em] text-paper/50 hover:text-paper transition-colors"
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
  const [email, setEmail]         = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e) {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-ink mt-16">
      <div className="max-w-[1440px] mx-auto px-6 pt-14 pb-6">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-12 border-b border-paper/10">

          <div className="md:col-span-2">
            <p className="font-display font-black text-[64px] leading-[0.95] tracking-[-0.03em] uppercase text-paper">
              DA SHOP<span className="text-paper/40">.</span>
            </p>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-paper/30 mt-4 max-w-[200px]">
              A multi-brand catalog of basics.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10">
            <FooterColumn title="Shop"    links={shopLinks} />
            <FooterColumn title="Schools" links={schoolLinks} />
            <FooterColumn title="Support" links={supportLinks} />
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-8 border-b border-paper/10">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-paper/40 font-medium shrink-0">
            Stay Updated
          </p>
          {subscribed ? (
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-paper/50">
              ✓ You're in.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-paper/20 px-4 py-2.5 text-paper/70 placeholder-paper/30 font-mono text-[11px] tracking-[0.05em] focus:outline-none focus:border-paper/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-paper text-ink font-black text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-paper/90 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6">
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-paper/20">
            © DA SHOP. All Rights Reserved.
          </p>
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-paper/15">
            Built for the Community
          </p>
        </div>
      </div>
    </footer>
  )
}
