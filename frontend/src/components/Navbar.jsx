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

const TICKER = 'FREE SHIPPING OVER $80 ··· NEW DROPS WEEKLY ··· DA SHOP IS A MULTI-BRAND CATALOG OF BASICS ··· SCHOOL ORDERS NOW OPEN ··· '

export default function Navbar() {
  const [menuOpen, setMenuOpen]                   = useState(false)
  const [shopOpen, setShopOpen]                   = useState(false)
  const [schoolsOpen, setSchoolsOpen]             = useState(false)
  const [mobileShopOpen, setMobileShopOpen]       = useState(false)
  const [mobileSchoolsOpen, setMobileSchoolsOpen] = useState(false)

  const { totalItems, openDrawer } = useCart()
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
          {Array(8).fill(TICKER).map((t, i) => (
            <span key={i} className="font-mono text-[11px] tracking-[0.16em] uppercase text-paper/60 shrink-0 px-6">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Main nav — 3-column grid: links | brandmark | icons */}
      <div className="bg-paper border-b border-ink">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-[1fr_auto_1fr] items-center h-16">

          {/* LEFT: nav links */}
          <div className="hidden lg:flex items-center gap-7">

            {/* SHOP dropdown */}
            <div className="relative flex items-center" onMouseEnter={openShop} onMouseLeave={closeShop}>
              <NavLink
                to="/category/clothing"
                className={({ isActive }) => navLink(isActive, shopOpen)}
              >
                Shop
              </NavLink>
              {shopOpen && (
                <div className="absolute top-full left-0 pt-3 z-50">
                  <div className="bg-paper border border-ink py-2 min-w-[200px]">
                    {shopCategories.map((item, i) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setShopOpen(false)}
                        className={`flex justify-between items-center px-4 py-2 font-mono text-[11px] tracking-[0.1em] uppercase hover:bg-ink hover:text-paper transition-colors ${
                          i === 0
                            ? 'font-semibold text-ink border-b border-rule mb-1 pb-2.5'
                            : 'text-mute'
                        }`}
                      >
                        <span>{item.label}</span>
                        {i > 0 && <span className="text-mute-2 text-[10px]">→</span>}
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
            <div className="relative flex items-center" onMouseEnter={openSchools} onMouseLeave={closeSchools}>
              <NavLink
                to="/schools"
                className={({ isActive }) => navLink(isActive, schoolsOpen)}
              >
                Schools
              </NavLink>
              {schoolsOpen && (
                <div className="absolute top-full left-0 pt-3 z-50">
                  <div className="bg-paper border border-ink py-2 min-w-[200px]">
                    <div className="px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-mute border-b border-rule mb-1 pb-2.5">
                      Partner Schools
                    </div>
                    {schools.map((school) => (
                      <Link
                        key={school.id}
                        to={`/school/${school.id}`}
                        onClick={() => setSchoolsOpen(false)}
                        className="flex justify-between items-center px-4 py-2 font-mono text-[11px] tracking-[0.08em] uppercase text-mute hover:bg-ink hover:text-paper transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 inline-block shrink-0"
                            style={{ background: school.primaryColor || '#0a0a0a' }}
                          />
                          {school.name}
                        </span>
                        <span className="text-[10px] opacity-60">→</span>
                      </Link>
                    ))}
                    <Link
                      to="/schools"
                      onClick={() => setSchoolsOpen(false)}
                      className="block px-4 py-2.5 mt-1 border-t border-ink font-mono text-[11px] tracking-[0.14em] uppercase bg-ink text-paper hover:bg-accent hover:border-accent transition-colors"
                    >
                      View All Schools →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: brandmark */}
          <Link
            to="/"
            className="font-display font-black text-[26px] tracking-[-0.02em] uppercase leading-none text-ink whitespace-nowrap justify-self-center"
          >
            DA SHOP<span className="text-accent">.</span>
          </Link>

          {/* RIGHT: icon buttons */}
          <div className="hidden lg:flex items-center gap-2 justify-self-end">
            {customer ? (
              <>
                {customer.is_admin && (
                  <Link to="/admin" className={navLink(false)}>Admin</Link>
                )}
                <Link to="/profile" className={navLink(false) + ' mr-2'}>{customer.first_name}</Link>
              </>
            ) : (
              <Link to="/login" className={navLink(false) + ' mr-2'}>Sign In</Link>
            )}
            <IconBtn to="/profile" label="Account">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M3.5 21c1.6-4 4.7-6 8.5-6s6.9 2 8.5 6"/>
              </svg>
            </IconBtn>
            <CartIconBtn totalItems={totalItems} onOpen={openDrawer} />
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="lg:hidden flex items-center gap-3 justify-self-end">
            <CartIconBtn totalItems={totalItems} onOpen={openDrawer} />
            <button className="flex flex-col gap-[5px] p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <div className={`w-5 h-[1.5px] bg-ink transition-all ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-ink transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-[1.5px] bg-ink transition-all ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
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
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 font-mono text-[11px] tracking-[0.12em] uppercase text-mute hover:text-ink transition-colors">
              Sign In / Create Account
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

function IconBtn({ to, label, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="w-9 h-9 inline-flex items-center justify-center border border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
    >
      {children}
    </Link>
  )
}

function CartIconBtn({ totalItems, onOpen }) {
  return (
    <button onClick={onOpen} className="relative w-9 h-9 inline-flex items-center justify-center border border-ink text-ink hover:bg-ink hover:text-paper transition-colors" aria-label="Cart">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/>
        <path d="M3 4h3l2.6 12.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L22 8H6.4"/>
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-accent text-paper font-mono text-[10px] min-w-[16px] h-4 inline-flex items-center justify-center px-1">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  )
}
