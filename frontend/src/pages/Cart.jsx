import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function garmentLabel(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('hoodie'))                               return 'HOODIE'
  if (n.includes('long sleeve'))                         return 'LONG SLEEVE'
  if (n.includes('crewneck') || n.includes('crew neck')) return 'CREW NECK'
  return 'TEE'
}

function ItemThumb({ item }) {
  if (item.image || item.image_url) {
    return (
      <img
        src={item.image || item.image_url}
        alt={item.name}
        className="w-20 h-20 object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div
      className="w-20 h-20 flex-shrink-0 relative flex flex-col items-center justify-center gap-1 bg-ink"
      style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 8px, rgba(255,255,255,0.04) 8px 9px)' }}
    >
      <svg viewBox="0 0 100 100" className="w-[48%] h-auto opacity-25" fill="none" stroke="white" strokeWidth={2} strokeLinejoin="round">
        <path d="M26 28 L38 18 L42 28 C46 22 54 22 58 28 L62 18 L74 28 L84 42 L76 48 L72 40 L72 86 L28 86 L28 40 L24 48 L16 42 Z" />
      </svg>
      <span className="font-mono text-[7px] tracking-[0.14em] uppercase text-white/35">{garmentLabel(item.name)}</span>
    </div>
  )
}

// ─── Cart Page — /cart ─────────────────────────────────────────────────────────

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart()
  const { customer } = useAuth()
  const navigate = useNavigate()

  const freeShipping = totalPrice >= 80
  const shipping     = freeShipping ? 0 : 8.50

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-px bg-ink mx-auto mb-10" />
          <p className="font-mono text-mute text-[10px] tracking-[0.4em] uppercase mb-4">Your Bag</p>
          <h1
            className="font-display font-black uppercase text-ink mb-6"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', letterSpacing: '0.04em', lineHeight: 0.9 }}
          >
            EMPTY.
          </h1>
          <p className="text-mute text-sm mb-10 leading-relaxed">
            You haven't added anything yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-ink/80 transition-colors"
          >
            SHOP NOW →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-paper min-h-screen">

      {/* ── Heading ── */}
      <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-6">
        <div className="border-b border-ink pb-6 flex items-end justify-between gap-4">
          <h1
            className="font-display font-black uppercase text-ink leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
          >
            YOUR BAG.
          </h1>
          <p className="font-mono text-mute text-[11px] tracking-[0.14em] uppercase pb-1">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── Item list ── */}
          <div className="lg:col-span-2 flex flex-col gap-px bg-rule">
            {cart.map((item) => {
              const key = item.lineKey || `${item.id}|${item.variant?.color || ''}|${item.selectedSize || ''}`
              const lineTotal = (item.price * item.qty).toFixed(2)
              return (
                <div key={key} className="bg-white p-5 flex gap-5 items-start">

                  {/* Thumbnail */}
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <ItemThumb item={item} />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-mute text-[10px] tracking-[0.18em] uppercase mb-0.5">
                      {item.brand || item.subcategory || item.collection}
                    </p>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-ink font-black uppercase text-[13px] tracking-[0.02em] leading-snug mb-1 hover:text-mute transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    {(item.variant?.color || item.selectedSize) && (
                      <p className="font-mono text-mute text-[10px] tracking-[0.1em] uppercase mb-4">
                        {[
                          item.variant?.color  && `COLOR ${item.variant.color.toUpperCase()}`,
                          item.selectedSize    && `SIZE ${item.selectedSize}`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    {/* Qty + Remove */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(key, item.qty - 1)}
                        className="w-7 h-7 border border-rule text-ink font-bold text-sm hover:border-ink transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-ink font-bold text-sm w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(key, item.qty + 1)}
                        className="w-7 h-7 border border-rule text-ink font-bold text-sm hover:border-ink transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(key)}
                        className="ml-3 flex items-center gap-1.5 font-mono text-mute text-[10px] tracking-[0.1em] uppercase hover:text-red-400 transition-colors"
                      >
                        <svg width="11" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        REMOVE
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-ink font-black text-[15px]">${lineTotal}</p>
                    <p className="font-mono text-mute text-[10px] tracking-[0.04em] mt-0.5">
                      ${item.price} × {item.qty}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-rule p-8 sticky top-24">
              <p className="font-mono text-mute text-[10px] tracking-[0.2em] uppercase mb-2">ORDER SUMMARY</p>
              <h2 className="font-display font-black uppercase text-ink text-3xl mb-5">TOTALS.</h2>
              <div className="w-full h-px bg-rule mb-5" />

              <div className="flex flex-col gap-3.5 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-mute">SUBTOTAL</span>
                  <span className="text-ink font-bold text-sm">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-mute">SHIPPING</span>
                  <span className="text-ink font-bold text-sm">{freeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-mute">ESTIMATED TAX</span>
                  <span className="font-mono text-[9px] tracking-[0.05em] uppercase text-mute text-right">CALCULATED AT CHECKOUT</span>
                </div>
              </div>

              <div className="w-full h-px bg-ink mb-5" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-[11px] tracking-[0.15em] uppercase font-bold text-ink">TOTAL</span>
                <span className="text-ink font-black text-xl">${(totalPrice + shipping).toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors mb-4"
              >
                CHECKOUT →
              </button>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2 font-mono text-mute text-[10px] tracking-[0.1em] uppercase">
                <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                SECURE PAYMENT · ENCRYPTED
              </div>

              {!customer && (
                <div className="mt-6 pt-5 border-t border-rule">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute mb-2">Members get more</p>
                  <Link
                    to="/login?next=/checkout"
                    className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink font-bold hover:text-mute transition-colors"
                  >
                    SIGN IN OR JOIN →
                  </Link>
                </div>
              )}

              <button
                onClick={clearCart}
                className="block w-full text-center font-mono text-mute text-[10px] tracking-[0.1em] uppercase hover:text-red-400 transition-colors mt-5"
              >
                CLEAR BAG
              </button>

              <Link
                to="/"
                className="block text-center font-mono text-mute text-[10px] tracking-[0.1em] uppercase hover:text-ink transition-colors mt-3"
              >
                ← CONTINUE SHOPPING
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
