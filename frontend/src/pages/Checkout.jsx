import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:8000'
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PK  || ''

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary:    '#111111',
    colorBackground: '#ffffff',
    colorText:       '#111111',
    colorDanger:     '#ef4444',
    fontFamily:      'Inter, Arial, sans-serif',
    borderRadius:    '0px',
    spacingUnit:     '4px',
  },
  rules: {
    '.Input': { border: '1px solid #E5E5E5', boxShadow: 'none', padding: '12px 16px', fontSize: '14px' },
    '.Input:focus': { border: '1px solid #111111', boxShadow: 'none', outline: 'none' },
    '.Label': { fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600', color: '#111111' },
  },
}

// ── Step 2: Stripe payment form (must be inside <Elements>) ───────────────────

function PaymentStep({ clientSecret, shippingForm, cart, token, onBack, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.')
      setLoading(false)
      return
    }

    // Payment succeeded — create order on backend
    try {
      const { data } = await axios.post(
        `${API_URL}/orders`,
        {
          payment_intent_id: paymentIntent.id,
          ...shippingForm,
          items: cart.map((item) => ({
            product_id:   item.id,
            product_name: item.name,
            brand:        item.brand,
            price:        item.price,
            quantity:     item.qty,
            image:        item.image,
            variant:      item.variant?.color || null,
            size:         item.selectedSize || null,
          })),
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      onSuccess(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Order creation failed. Please contact support.')
      setLoading(false)
    }
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-5">
      <div className="bg-white p-8">
        <h2 className="text-midnight font-black uppercase tracking-wide text-[11px] mb-6">
          Payment Details
        </h2>
        <PaymentElement />
      </div>

      {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40"
      >
        {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-muted text-[10px] tracking-[0.15em] uppercase text-center hover:text-midnight transition-colors"
      >
        ← Back to Shipping
      </button>
    </form>
  )
}

// ── Dev fallback: no Stripe key configured ────────────────────────────────────

function DevPaymentStep({ shippingForm, cart, token, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(
        `${API_URL}/orders`,
        {
          ...shippingForm,
          items: cart.map((item) => ({
            product_id:   item.id,
            product_name: item.name,
            brand:        item.brand,
            price:        item.price,
            quantity:     item.qty,
            image:        item.image,
            variant:      item.variant?.color || null,
            size:         item.selectedSize || null,
          })),
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      onSuccess(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
      setLoading(false)
    }
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-white p-8 border border-[#E5E5E5]">
        <p className="text-[10px] tracking-[0.2em] uppercase font-black text-midnight mb-2">
          Dev Mode — Payment Skipped
        </p>
        <p className="text-muted text-xs leading-relaxed">
          <code>VITE_STRIPE_PK</code> is not set. Orders are created without payment verification.
          Set the env var to enable real Stripe payments.
        </p>
      </div>

      {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40"
      >
        {loading ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-muted text-[10px] tracking-[0.15em] uppercase text-center hover:text-midnight transition-colors"
      >
        ← Back to Shipping
      </button>
    </form>
  )
}

// ── Main Checkout component ───────────────────────────────────────────────────

export default function Checkout() {
  const { customer, token, saveCartToBackend } = useAuth()
  const { cart, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep]       = useState('shipping')   // 'shipping' | 'payment'
  const [clientSecret, setClientSecret] = useState('')
  const [intentLoading, setIntentLoading] = useState(false)

  const [form, setForm] = useState({
    email:            customer?.email || '',
    phone:            customer?.phone || '',
    shipping_name:    customer ? `${customer.first_name} ${customer.last_name}` : '',
    shipping_address: '',
    shipping_city:    '',
    shipping_postcode:'',
    shipping_country: 'New Zealand',
  })
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  async function handleShippingSubmit(e) {
    e.preventDefault()
    const required = ['email', 'shipping_name', 'shipping_address', 'shipping_city', 'shipping_postcode', 'shipping_country']
    if (required.some((k) => !form[k])) { setFormError('Please fill in all required fields.'); return }
    if (cart.length === 0) { setFormError('Your cart is empty.'); return }

    await saveCartToBackend(cart)

    if (!STRIPE_KEY) {
      setStep('payment')
      return
    }

    setIntentLoading(true)
    setFormError('')
    try {
      const amountCents = Math.round(totalPrice * 100)
      const { data } = await axios.post(
        `${API_URL}/payments/create-intent`,
        { amount_cents: amountCents },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      setClientSecret(data.client_secret)
      setStep('payment')
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not initialise payment. Please try again.')
    } finally {
      setIntentLoading(false)
    }
  }

  function handleSuccess(orderOrId) {
    clearCart()
    // Guest flow: pass the full order payload via location.state so the
    // confirmation page can render without a token (it can't re-fetch).
    if (orderOrId && typeof orderOrId === 'object') {
      navigate(`/order-confirmation/${orderOrId.id}`, { state: { order: orderOrId, guest: !token } })
    } else {
      navigate(`/order-confirmation/${orderOrId}`)
    }
  }

  const orderSummaryPanel = (
    <div className="lg:col-span-1">
      <div className="bg-white border border-[#E5E5E5] p-8 sticky top-24">
        <h2 className="text-midnight text-[11px] tracking-[0.2em] uppercase font-black mb-6">
          Order Summary
        </h2>
        <div className="flex flex-col gap-px bg-[#E5E5E5] mb-6">
          {cart.map((item) => (
            <div key={item.lineKey || `${item.id}|${item.variant?.color || ''}|${item.selectedSize || ''}`} className="bg-white flex gap-3 p-3">
              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-muted text-[10px] tracking-wide uppercase">{item.brand}</p>
                <p className="text-midnight font-bold text-xs leading-snug truncate">{item.name}</p>
                {item.variant?.color && (
                  <p className="text-muted text-[10px]">Color: {item.variant.color}</p>
                )}
                {item.selectedSize && (
                  <p className="text-muted text-[10px]">Size: {item.selectedSize}</p>
                )}
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
        {step === 'shipping' && (
          <Link
            to="/cart"
            className="block text-center text-muted text-[10px] tracking-[0.15em] uppercase hover:text-midnight transition-colors mt-6"
          >
            ← Edit Cart
          </Link>
        )}
      </div>
    </div>
  )

  if (cart.length === 0 && step === 'shipping') {
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

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="w-8 h-px bg-midnight mb-6" />
          <h1
            className="text-midnight font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
          >
            Checkout
          </h1>
          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-4">
            {['shipping', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className={`text-[10px] tracking-[0.15em] uppercase font-bold ${step === s ? 'text-midnight' : 'text-muted'}`}>
                  {i + 1}. {s === 'shipping' ? 'Shipping' : 'Payment'}
                </span>
                {i === 0 && <span className="text-muted text-[10px]">/</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* ── Step 1: Shipping ── */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="lg:col-span-2 flex flex-col gap-5">
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
                        {f.required
                          ? <span className="text-red-400">*</span>
                          : <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
                        }
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
                    { name: 'shipping_name',     label: 'Full Name',      placeholder: 'Name on package' },
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

              {formError && <p className="text-red-400 text-xs tracking-wide">{formError}</p>}

              <button
                type="submit"
                disabled={intentLoading}
                className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-midnight/80 transition-colors disabled:opacity-40"
              >
                {intentLoading ? 'Loading Payment…' : 'Continue to Payment →'}
              </button>
            </form>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'payment' && (
            <div className="lg:col-span-2">
              {STRIPE_KEY && clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                >
                  <PaymentStep
                    clientSecret={clientSecret}
                    shippingForm={form}
                    cart={cart}
                    token={token}
                    onBack={() => setStep('shipping')}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              ) : (
                <DevPaymentStep
                  shippingForm={form}
                  cart={cart}
                  token={token}
                  onBack={() => setStep('shipping')}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          )}

          {orderSummaryPanel}
        </div>
      </section>
    </main>
  )
}
