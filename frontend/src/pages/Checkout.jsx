import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Checkout() {
  const { customer, token, saveCartToBackend } = useAuth()
  const { cart, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email:            customer?.email     || '',
    phone:            customer?.phone     || '',
    shipping_name:    customer ? `${customer.first_name} ${customer.last_name}` : '',
    shipping_address: '',
    shipping_city:    '',
    shipping_postcode:'',
    shipping_country: 'New Zealand',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const required = ['email', 'shipping_name', 'shipping_address', 'shipping_city', 'shipping_postcode', 'shipping_country']
    if (required.some((k) => !form[k])) { setError('Please fill in all required fields.'); return }
    if (cart.length === 0) { setError('Your cart is empty.'); return }

    setLoading(true)

    // Save cart to backend (marks abandonment start) before submitting
    await saveCartToBackend(cart)

    try {
      const { data } = await axios.post(
        `${API_URL}/orders`,
        {
          ...form,
          items: cart.map((item) => ({
            product_id:   item.id,
            product_name: item.name,
            brand:        item.brand,
            price:        item.price,
            quantity:     item.qty,
            image:        item.image,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      clearCart()
      navigate(`/order-confirmation/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-10 h-px bg-midnight mx-auto mb-10" />
          <h1 className="text-midnight font-black uppercase text-2xl mb-4">Cart is Empty</h1>
          <Link to="/" className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors">
            Shop Now
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[88px] bg-[#F7F7F7] min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="w-8 h-px bg-midnight mb-6" />
          <h1
            className="text-midnight font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
          >
            Checkout
          </h1>
        </div>
      </div>

      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* ── Shipping form ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-5">

            <div className="bg-white p-8">
              <h2 className="text-midnight font-black uppercase tracking-wide text-[11px] mb-6">
                Contact Information
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'email', label: 'Email Address', type: 'email', required: true },
                  { name: 'phone', label: 'Phone Number',  type: 'tel',   required: false },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                      {f.label}{' '}
                      {f.required ? <span className="text-red-400">*</span> : <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8">
              <h2 className="text-midnight font-black uppercase tracking-wide text-[11px] mb-6">
                Shipping Address
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'shipping_name',     label: 'Full Name',     placeholder: 'Name on package' },
                  { name: 'shipping_address',  label: 'Street Address', placeholder: '123 Pacific Rd' },
                  { name: 'shipping_city',     label: 'City',           placeholder: 'Auckland' },
                  { name: 'shipping_postcode', label: 'Postcode',       placeholder: '1010' },
                  { name: 'shipping_country',  label: 'Country',        placeholder: 'New Zealand' },
                ].map((f) => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                      {f.label} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40"
            >
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>

            <p className="text-muted text-[10px] tracking-wide text-center">
              By placing your order you agree to our terms. Payment is collected by the vendor directly.
            </p>
          </form>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E5E5] p-8 sticky top-24">
              <h2 className="text-midnight text-[11px] tracking-[0.2em] uppercase font-black mb-6">
                Order Summary
              </h2>

              <div className="flex flex-col gap-px bg-[#E5E5E5] mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white flex gap-3 p-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted text-[10px] tracking-wide uppercase">{item.brand}</p>
                      <p className="text-midnight font-bold text-xs leading-snug truncate">{item.name}</p>
                      <p className="text-muted text-[10px]">×{item.qty}</p>
                    </div>
                    <span className="text-midnight font-bold text-xs flex-shrink-0">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-[#E5E5E5] mb-4" />
              <div className="flex justify-between items-center">
                <span className="text-midnight text-[11px] tracking-[0.15em] uppercase font-semibold">Total</span>
                <span className="text-midnight font-black text-xl">${totalPrice.toFixed(2)}</span>
              </div>

              <Link
                to="/cart"
                className="block text-center text-muted text-[10px] tracking-[0.15em] uppercase hover:text-midnight transition-colors mt-6"
              >
                ← Edit Cart
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
