import { useState, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { schools } from '../data/schools'

const shopCategories = [
  { label: 'All Clothing',  to: '/category/clothing' },
  { label: 'Tees',          to: '/category/clothing?sub=t-shirts' },
  { label: 'Long Sleeves',  to: '/category/clothing?sub=long-sleeves' },
  { label: 'Crew Necks',    to: '/category/clothing?sub=crew-necks' },
  { label: 'Hoodies',       to: '/category/clothing?sub=hoodies' },
]

const TICKER = 'FREE SHIPPING OVER $80 · NEW DROPS WEEKLY · SCHOOL ORDERS NOW OPEN · FILIKU · TRAPACHINO · DA SHOP · '

export default function Navbar() {
  const [menuOpen, setMenuOpen]                   = useState(false)
  const [shopOpen, setShopOpen]                   = useState(false)
  const [schoolsOpen, setSchoolsOpen]             = useState(false)
  const [mobileShopOpen, setMobileShopOpen]       = useState(false)
  const [mobileSchoolsOpen, setMobileSchoolsOpen] = useState(false)

  const { totalItems } = useCart()
  const { customer } = useAuth()

  const shopTimer    = useRef(null)
  const schoolsTimer = useRef(null)

  function openShop()    { clearTimeout(shopTimer.current);    setShopOpen(true) }
  function closeShop()   { shopTimer.current    = setTimeout(() => setShopOpen(false), 180) }
  function openSchools() { clearTimeout(schoolsTimer.current); setSchoolsOpen(true) }
  function closeSchools(){ schoolsTimer.current = setTimeout(() => setSchoolsOpen(false), 180) }

  const navLink = (isActive, isOpen = false) =>
    `font-mono text-[12px] tracking-[0.14em] uppercase border-b pb-0.5 transition-colors ${
      isActive || isOpen
        ? 'border-ink text-ink'
        : 'border-transparent text-mute hover:text-ink hover:border-ink'
    }`

  return (
    <nav className="sticky top-0 z-50">

      {/* Ticker */}
      <div className="bg-ink overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-ticker">
          {Array(6).fill(TICKER).map((t, i) => (
            <span key={i} className="font-mono text-[11px] tracking-[0.16em] uppercase text-paper/60 shrink-0">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-paper border-b border-ink">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-16">

          {/* Brandmark */}
          <Link to="/" className="font-display font-black text-[26px] tracking-[-0.02em] uppercase leading-none text-ink shrink-0">
            DA SHOP<span className="text-accent">.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">

            {/* SHOP dropdown */}
            <div className="relative" onMouseEnter={openShop} onMouseLeave={closeShop}>
              <NavLink
                to="/category/clothing"
                className={({ isActive }) => navLink(isActive, shopOpen)}
              >
                Shop
              </NavLink>
              {shopOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                  <div className="bg-paper border border-ink py-2 w-44">
                    {shopCategories.map((item, i) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setShopOpen(false)}
                        className={`block px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase hover:bg-ink hover:text-paper transition-colors ${
                          i === 0
                            ? 'font-semibold text-ink border-b border-rule mb-1 pb-2'
                            : 'text-mute'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BRANDS */}
            <NavLink to="/brands" className={({ isActive }) => navLink(isActive)}>
              Brands
            </NavLink>

            {/* SCHOOLS dropdown */}
            <div className="relative" onMouseEnter={openSchools} onMouseLeave={closeSchools}>
              <NavLink
                to="/schools"
                className={({ isActive }) => navLink(isActive, schoolsOpen)}
              >
                Schools
              </NavLink>
              {schoolsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                  <div className="bg-paper border border-ink py-2 w-48">
                    <Link
                      to="/schools"
                      onClick={() => setSchoolsOpen(false)}
                      className="block px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase font-semibold text-ink hover:bg-ink hover:text-paper border-b border-rule mb-1 pb-2 transition-colors"
                    >
                      All Schools
                    </Link>
                    {schools.map((school) => (
                      <Link
                        key={school.id}
                        to={`/school/${school.id}`}
                        onClick={() => setSchoolsOpen(false)}
                        className="block px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-mute hover:text-ink hover:bg-ink/5 transition-colors"
                      >
                        {school.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-6">
            {customer ? (
              <>
                {customer.is_admin && (
                  <Link to="/admin" className={navLink(false)}>Admin</Link>
                )}
                {customer.role === 'vendor' && customer.brand_id && (
                  <Link to="/vendor" className={navLink(false)}>Vendor</Link>
                )}
                <Link to="/profile" className={navLink(false)}>{customer.first_name}</Link>
              </>
            ) : (
              <Link to="/login" className={navLink(false)}>Sign In</Link>
            )}
            <Link to="/become-a-vendor" className={navLink(false)}>Sell</Link>
            <CartIcon totalItems={totalItems} />
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="lg:hidden flex items-center gap-4">
            <CartIcon totalItems={totalItems} />
            <button className="p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <div className={`w-5 h-[1.5px] bg-ink transition-all ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-ink my-[4px] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-ink transition-all ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-paper border-b border-ink px-6 py-6 flex flex-col gap-1">

          {/* SHOP */}
          <div>
            <button
              onClick={() => setMobileShopOpen(!mobileShopOpen)}
              className="w-full flex items-center justify-between py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors"
            >
              Shop <span className="text-lg leading-none">{mobileShopOpen ? '−' : '+'}</span>
            </button>
            {mobileShopOpen && (
              <div className="pl-4 flex flex-col gap-0.5 pb-2">
                {shopCategories.map((item, i) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase hover:text-ink transition-colors ${
                      i === 0 ? 'font-semibold text-ink' : 'text-mute'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/brands"
            onClick={() => setMenuOpen(false)}
            className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors"
          >
            Brands
          </Link>

          {/* SCHOOLS */}
          <div>
            <button
              onClick={() => setMobileSchoolsOpen(!mobileSchoolsOpen)}
              className="w-full flex items-center justify-between py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors"
            >
              Schools <span className="text-lg leading-none">{mobileSchoolsOpen ? '−' : '+'}</span>
            </button>
            {mobileSchoolsOpen && (
              <div className="pl-4 flex flex-col gap-0.5 pb-2">
                <Link
                  to="/schools"
                  onClick={() => setMenuOpen(false)}
                  className="py-1.5 font-mono font-semibold text-ink text-[11px] tracking-[0.1em] uppercase hover:text-mute transition-colors"
                >
                  All Schools
                </Link>
                {schools.map((school) => (
                  <Link
                    key={school.id}
                    to={`/school/${school.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="py-1.5 font-mono text-mute text-[11px] tracking-[0.1em] uppercase hover:text-ink transition-colors"
                  >
                    {school.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-rule my-2" />

          {customer ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors">
                My Account ({customer.first_name})
              </Link>
              {customer.is_admin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors">
                  Admin Dashboard
                </Link>
              )}
              {customer.role === 'vendor' && customer.brand_id && (
                <Link to="/vendor" onClick={() => setMenuOpen(false)} className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors">
                  Vendor Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors">
              Sign In / Create Account
            </Link>
          )}

          <Link
            to="/become-a-vendor"
            onClick={() => setMenuOpen(false)}
            className="bg-ink text-paper font-mono text-[11px] tracking-[0.12em] uppercase font-medium px-5 py-3 text-center hover:bg-accent transition-colors mt-2"
          >
            Become a Vendor
          </Link>
        </div>
      )}
    </nav>
  )
}

function CartIcon({ totalItems }) {
  return (
    <Link to="/cart" className="relative flex items-center" aria-label="Cart">
      <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-ink text-paper text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
