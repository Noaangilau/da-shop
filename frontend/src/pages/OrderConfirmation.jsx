import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { token } = useAuth()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, token])

  if (loading) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="pt-[88px] min-h-screen bg-[#F7F7F7]">

      {/* ── Confirmation header ── */}
      <div className="bg-midnight py-20 px-6 text-center">
        <div className="w-10 h-px bg-white/30 mx-auto mb-10" />
        <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase font-medium mb-4">
          Order #{order?.id}
        </p>
        <h1
          className="text-white font-black uppercase"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.04em' }}
        >
          Order Confirmed
        </h1>
        <p className="text-white/50 text-sm mt-4 max-w-sm mx-auto leading-relaxed">
          Thanks for supporting Pacific vendors. A confirmation has been sent to{' '}
          <span className="text-white/80">{order?.email}</span>.
        </p>
      </div>

      <section className="max-w-[800px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E5E5E5]">

          {/* Items */}
          <div className="bg-white p-8">
            <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-black mb-6">
              Items Ordered
            </p>
            <div className="flex flex-col gap-4">
              {(Array.isArray(order?.items) ? order.items : []).map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-muted text-[10px] tracking-wide uppercase">{item.brand}</p>
                    <p className="text-midnight font-bold text-sm">{item.product_name}</p>
                    <p className="text-muted text-xs">×{item.quantity}</p>
                  </div>
                  <span className="text-midnight font-bold text-sm flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-[#E5E5E5] flex justify-between">
                <span className="text-midnight text-[11px] tracking-[0.15em] uppercase font-black">Total</span>
                <span className="text-midnight font-black text-lg">${Number(order?.total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white p-8">
            <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-black mb-6">
              Shipping To
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-midnight font-bold text-sm">{order?.shipping_name}</p>
              <p className="text-gray-500 text-sm">{order?.shipping_address}</p>
              <p className="text-gray-500 text-sm">{order?.shipping_city} {order?.shipping_postcode}</p>
              <p className="text-gray-500 text-sm">{order?.shipping_country}</p>
            </div>
            {order?.phone && (
              <p className="text-muted text-xs mt-4">{order.phone}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <Link
            to="/"
            className="flex-1 bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 text-center hover:bg-midnight/80 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/profile"
            className="flex-1 border border-midnight text-midnight font-black text-[11px] tracking-[0.15em] uppercase py-4 text-center hover:bg-midnight hover:text-white transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </section>
    </main>
  )
}
