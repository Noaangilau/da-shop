import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API_URL    = import.meta.env.VITE_API_URL   || 'http://localhost:8000'
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PK || ''

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary:    '#0a0a0a',
    colorBackground: '#f5f1ea',
    colorText:       '#0a0a0a',
    colorDanger:     '#ef4444',
    fontFamily:      'Inter, Arial, sans-serif',
    borderRadius:    '0px',
    spacingUnit:     '4px',
  },
  rules: {
    '.Input': { border: '1px solid #d9d4ca', boxShadow: 'none', padding: '12px 16px', fontSize: '14px', backgroundColor: '#f5f1ea' },
    '.Input:focus': { border: '1px solid #0a0a0a', boxShadow: 'none', outline: 'none' },
    '.Label': { fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600', color: '#0a0a0a' },
  },
}

// ── Field component ────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'border border-rule bg-paper px-4 py-3 text-sm text-ink placeholder-mute focus:outline-none focus:border-ink transition-colors'

// ── Stripe payment step ────────────────────────────────────────────────────────
function PaymentStep({ shippingForm, cart, token, onBack, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' })
    if (stripeError) { setError(stripeError.message || 'Payment failed.'); setLoading(false); return }
    try {
      const { data } = await axios.post(
        `${API_URL}/orders`,
        {
          payment_intent_id: paymentIntent.id,
          ...shippingForm,
          items: cart.map((item) => ({
            product_id: item.id, product_name: item.name, brand: item.brand,
            price: item.price, quantity: item.qty, image: item.image,
            variant: item.variant?.color || null, size: item.selectedSize || null,
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

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <div className="border border-rule p-6 bg-white">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-4 pb-3 border-b border-rule">
          03 · PAYMENT DETAILS
        </p>
        <PaymentElement />
      </div>
      {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors disabled:opacity-40"
      >
        {loading ? 'Processing…' : `PAY $${total.toFixed(2)} →`}
      </button>
      <button type="button" onClick={onBack} className="font-mono text-mute text-[10px] tracking-[0.12em] uppercase text-center hover:text-ink transition-colors">
        ← BACK TO SHIPPING
      </button>
    </form>
  )
}

// ── Dev fallback (no Stripe key) ───────────────────────────────────────────────
function DevPaymentStep({ shippingForm, cart, token, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

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
            product_id: item.id, product_name: item.name, brand: item.brand,
            price: item.price, quantity: item.qty, image: item.image,
            variant: item.variant?.color || null, size: item.selectedSize || null,
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="border border-rule p-5 bg-paper">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute">Dev mode — payment skipped</p>
      </div>
      {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors disabled:opacity-40"
      >
        {loading ? 'Placing Order…' : `PLACE ORDER — $${total.toFixed(2)}`}
      </button>
      <button type="button" onClick={onBack} className="font-mono text-mute text-[10px] tracking-[0.12em] uppercase text-center hover:text-ink transition-colors">
        ← BACK TO SHIPPING
      </button>
    </form>
  )
}

// ── Main Checkout ──────────────────────────────────────────────────────────────
export default function Checkout() {
  const { customer, token, saveCartToBackend } = useAuth()
  const { cart, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep]                   = useState('shipping')
  const [clientSecret, setClientSecret]   = useState('')
  const [intentLoading, setIntentLoading] = useState(false)
  const [discountCode, setDiscountCode]   = useState('')

  const [form, setForm] = useState({
    email:             customer?.email      || '',
    phone:             customer?.phone      || '',
    shipping_name:     customer ? `${customer.first_name} ${customer.last_name}` : '',
    shipping_address:  '',
    shipping_city:     '',
    shipping_postcode: '',
    shipping_country:  'New Zealand',
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

    if (!STRIPE_KEY) { setStep('payment'); return }

    setIntentLoading(true)
    setFormError('')
    try {
      const { data } = await axios.post(
        `${API_URL}/payments/create-intent`,
        { amount_cents: Math.round(totalPrice * 100) },
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
    if (orderOrId && typeof orderOrId === 'object') {
      navigate(`/order-confirmation/${orderOrId.id}`, { state: { order: orderOrId, guest: !token } })
    } else {
      navigate(`/order-confirmation/${orderOrId}`)
    }
  }

  const freeShipping = totalPrice >= 80
  const shipping     = freeShipping ? 0 : 8.50

  if (cart.length === 0 && step === 'shipping') {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-px bg-ink mx-auto mb-10" />
          <h1 className="font-display font-black uppercase text-ink text-3xl mb-4">CART IS EMPTY</h1>
          <Link to="/" className="inline-block bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-ink/80 transition-colors">
            SHOP NOW
          </Link>
        </div>
      </main>
    )
  }

  // ── Right panel: order summary ──────────────────────────────────────────────
  const summaryPanel = (
    <div className="lg:col-span-1">
      <div className="bg-white border border-rule sticky top-24">
        {/* Header */}
        <div className="px-6 py-5 border-b border-rule">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-1">
            ORDER · {cart.reduce((s, i) => s + i.qty, 0)} ITEMS
          </p>
          <h2 className="font-display font-black uppercase text-ink text-2xl">SUMMARY.</h2>
        </div>

        {/* Items */}
        <div className="p-4 flex flex-col gap-3 border-b border-rule">
          {cart.map((item) => (
            <div
              key={item.lineKey || `${item.id}|${item.variant?.color || ''}|${item.selectedSize || ''}`}
              className="flex gap-3 items-start"
            >
              {/* Thumbnail with qty badge */}
              <div className="relative flex-shrink-0">
                {item.qty > 1 && (
                  <span className="absolute -top-1.5 -left-1.5 z-10 bg-ink text-paper font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.qty}
                  </span>
                )}
                {(item.image || item.image_url) ? (
                  <img
                    src={item.image || item.image_url}
                    alt={item.name}
                    className="w-14 h-14 object-cover bg-paper flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-14 h-14 bg-ink flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(255,255,255,0.04) 6px 7px)' }}
                  >
                    <svg viewBox="0 0 100 100" className="w-[50%] opacity-25" fill="none" stroke="white" strokeWidth={2.5} strokeLinejoin="round">
                      <path d="M26 28 L38 18 L42 28 C46 22 54 22 58 28 L62 18 L74 28 L84 42 L76 48 L72 40 L72 86 L28 86 L28 40 L24 48 L16 42 Z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-mute text-[9px] tracking-[0.14em] uppercase">{item.brand || item.collection}</p>
                <p className="text-ink font-bold text-[11px] uppercase tracking-[0.02em] leading-snug truncate">{item.name}</p>
                <p className="font-mono text-mute text-[9px] tracking-[0.08em] uppercase">
                  {[item.selectedSize && item.selectedSize, item.variant?.color && item.variant.color.toUpperCase()].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="text-ink font-bold text-[12px] flex-shrink-0">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Discount code */}
        <div className="p-4 border-b border-rule flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="DISCOUNT CODE"
            className="flex-1 border border-rule bg-paper px-3 py-2.5 font-mono text-[10px] tracking-[0.1em] uppercase text-ink placeholder-mute/50 focus:outline-none focus:border-ink transition-colors"
          />
          <button className="bg-ink text-paper font-mono font-bold text-[10px] tracking-[0.12em] uppercase px-4 py-2.5 hover:bg-ink/80 transition-colors flex-shrink-0">
            APPLY
          </button>
        </div>

        {/* Totals */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute">SUBTOTAL</span>
            <span className="text-ink font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute">SHIPPING</span>
            <span className="text-ink font-bold">{freeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="w-full h-px bg-rule" />
          <div className="flex justify-between items-center">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase font-bold text-ink">TOTAL</span>
            <span className="text-ink font-black text-lg">${(totalPrice + shipping).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <main className="bg-paper min-h-screen">

      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── Left: form ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {step === 'shipping' && (
              <>
                {/* EXPRESS CHECKOUT */}
                <div className="border border-rule bg-white">
                  <div className="px-6 py-4 border-b border-rule">
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-bold">EXPRESS CHECKOUT</p>
                  </div>
                  <div className="p-5 flex flex-col sm:flex-row gap-3">
                    {/* Apple Pay */}
                    <button
                      type="button"
                      disabled
                      className="flex-1 bg-black text-white font-bold text-[13px] py-3.5 flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    >
                      🍎 <span className="font-mono text-[11px] tracking-[0.1em] uppercase">PAY</span>
                    </button>
                    {/* Shop Pay */}
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-3.5 flex items-center justify-center font-mono text-[11px] tracking-[0.12em] uppercase text-white font-bold opacity-60 cursor-not-allowed"
                      style={{ backgroundColor: '#5a31f4' }}
                    >
                      SHOP PAY
                    </button>
                    {/* PayPal */}
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-3.5 flex items-center justify-center font-mono text-[11px] tracking-[0.12em] uppercase text-ink font-bold opacity-60 cursor-not-allowed"
                      style={{ backgroundColor: '#ffc439' }}
                    >
                      PAYPAL
                    </button>
                  </div>
                  <div className="px-5 pb-5 flex items-center gap-3">
                    <div className="flex-1 h-px bg-rule" />
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-mute">OR ENTER DETAILS</span>
                    <div className="flex-1 h-px bg-rule" />
                  </div>
                </div>

                <form onSubmit={handleShippingSubmit} className="flex flex-col gap-4">
                  {/* 01 · CONTACT */}
                  <div className="border border-rule bg-white">
                    <div className="px-6 py-4 border-b border-rule">
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-bold">01 · CONTACT</p>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      <Field label="Email Address">
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          className={inputCls}
                        />
                      </Field>
                      <Field label={<>Phone Number <span className="text-mute font-normal normal-case tracking-normal text-xs">(optional)</span></>}>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* 02 · SHIPPING ADDRESS */}
                  <div className="border border-rule bg-white">
                    <div className="px-6 py-4 border-b border-rule">
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-bold">02 · SHIPPING ADDRESS</p>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      {[
                        { name: 'shipping_name',     label: 'Full Name',      placeholder: 'Name on package',  required: true },
                        { name: 'shipping_address',  label: 'Street Address', placeholder: '123 Pacific Rd',   required: true },
                        { name: 'shipping_city',     label: 'City',           placeholder: 'Auckland',          required: true },
                        { name: 'shipping_postcode', label: 'Postcode',       placeholder: '1010',              required: true },
                        { name: 'shipping_country',  label: 'Country',        placeholder: 'New Zealand',       required: true },
                      ].map((f) => (
                        <Field key={f.name} label={f.label}>
                          <input
                            type="text"
                            name={f.name}
                            required={f.required}
                            value={form[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className={inputCls}
                          />
                        </Field>
                      ))}
                    </div>
                  </div>

                  {formError && <p className="text-red-400 text-xs tracking-wide">{formError}</p>}

                  <button
                    type="submit"
                    disabled={intentLoading}
                    className="bg-ink text-paper font-black text-[11px] tracking-[0.15em] uppercase py-4 hover:bg-ink/80 transition-colors disabled:opacity-40"
                  >
                    {intentLoading ? 'LOADING PAYMENT…' : 'CONTINUE TO PAYMENT →'}
                  </button>

                  <div className="flex items-center justify-center gap-2 font-mono text-mute text-[10px] tracking-[0.1em] uppercase">
                    <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    SECURE PAYMENT · ENCRYPTED
                  </div>
                </form>
              </>
            )}

            {step === 'payment' && (
              STRIPE_KEY && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                  <PaymentStep
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
              )
            )}
          </div>

          {summaryPanel}
        </div>
      </section>
    </main>
  )
}
