import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, removeFromCart, updateQty, totalItems, totalPrice } = useCart()

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60]"
          onClick={closeDrawer}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase font-bold text-ink">
            Cart{totalItems > 0 && <span className="text-mute font-normal ml-1">({totalItems})</span>}
          </p>
          <button
            onClick={closeDrawer}
            className="text-mute hover:text-ink text-2xl leading-none transition-colors"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-8 h-px bg-ink mb-6" />
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute mb-6">
                Your cart is empty
              </p>
              <button
                onClick={closeDrawer}
                className="bg-ink text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-ink/80 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {cart.map((item) => {
                const key = item.lineKey
                return (
                  <li key={key} className="flex gap-4 px-6 py-5">
                    <div className="w-20 h-20 bg-paper flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-ink/5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {item.collection && (
                        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mute">
                          {item.collection}
                        </p>
                      )}
                      <p className="text-ink font-bold text-sm leading-snug truncate">
                        {item.name}
                      </p>
                      {item.selectedSize && (
                        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mute">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex items-center border border-rule">
                          <button
                            onClick={() => updateQty(key, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center text-mute hover:text-ink hover:bg-paper transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-mono text-[11px] text-ink">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(key, item.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-mute hover:text-ink hover:bg-paper transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-ink font-bold text-sm">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(key)}
                            className="text-mute hover:text-ink transition-colors text-lg leading-none"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-rule px-6 py-6 bg-white">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-mute">Subtotal</span>
              <span className="text-ink font-black text-xl">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-mute mb-5">
              Shipping &amp; taxes calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full bg-ink text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 text-center hover:bg-ink/80 transition-colors"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
