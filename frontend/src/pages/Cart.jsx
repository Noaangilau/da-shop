import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart()

  if (cart.length === 0) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-px bg-midnight mx-auto mb-10" />
          <p className="text-muted text-xs tracking-widest uppercase mb-4">Your Cart</p>
          <h1 className="text-midnight text-3xl font-black uppercase tracking-wide mb-4">
            Cart is Empty
          </h1>
          <p className="text-gray-400 text-sm mb-10">
            You haven't added anything yet. Start browsing to find something you love.
          </p>
          <Link
            to="/"
            className="inline-block bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[88px] bg-white min-h-screen">

      {/* ── Header ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="w-12 h-px bg-midnight mb-8" />
          <p className="text-muted text-xs tracking-widest uppercase font-semibold mb-3">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
          <h1 className="text-midnight text-4xl font-black uppercase tracking-wide">
            Your Cart
          </h1>
        </div>
      </div>

      {/* ── Cart Body ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* ── Items List ── */}
          <div className="lg:col-span-2 flex flex-col gap-px bg-gray-100">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 flex gap-5 items-start">

                {/* Thumbnail */}
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-muted text-xs tracking-widest uppercase font-medium mb-1">
                    {item.vendor}
                  </p>
                  <Link to={`/product/${item.id}`}>
                    <h3 className="text-midnight font-bold text-sm leading-snug mb-3 hover:text-muted transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Qty controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 border border-gray-200 text-midnight text-sm font-bold hover:border-midnight transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-midnight text-sm font-bold w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 border border-gray-200 text-midnight text-sm font-bold hover:border-midnight transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Remove */}
                <div className="flex flex-col items-end gap-4 flex-shrink-0">
                  <span className="text-midnight font-black text-base">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted text-xs tracking-widest uppercase hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="border border-gray-100 p-8 sticky top-24">
              <h2 className="text-midnight text-xs tracking-widest uppercase font-black mb-8">
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate pr-4">
                      {item.name} <span className="text-muted">×{item.qty}</span>
                    </span>
                    <span className="text-midnight font-bold flex-shrink-0">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-gray-100 mb-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="text-midnight text-xs tracking-widest uppercase font-semibold">
                  Total
                </span>
                <span className="text-midnight font-black text-xl">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <button className="w-full bg-midnight text-white font-black text-xs tracking-widest uppercase py-4 hover:bg-midnight/80 transition-colors duration-200 mb-3">
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-muted text-xs tracking-widest uppercase hover:text-midnight transition-colors mt-4"
              >
                ← Continue Shopping
              </Link>

              <button
                onClick={clearCart}
                className="block w-full text-center text-muted text-xs tracking-widest uppercase hover:text-red-400 transition-colors mt-5"
              >
                Clear Cart
              </button>
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
