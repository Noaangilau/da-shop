import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    message: '',
  })
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'What are your sizing guidelines?',
      answer: 'All DA SHOP garments are sized true-to-fit. We recommend ordering your usual size. For a more relaxed fit, size up one. Measurements for each product are available on the product detail page. If you\'re between sizes, we suggest sizing up for heavyweight items (10oz+).'
    },
    {
      id: 2,
      question: 'How do I return or exchange an item?',
      answer: 'We accept returns within 30 days of delivery for unworn, unwashed items with tags attached. Start a return from your account dashboard or email returns@dashop.com with your order number. Exchanges are processed as returns + new orders. Return shipping is $8 (deducted from refund) unless the item is defective.'
    },
    {
      id: 3,
      question: 'What shipping options do you offer?',
      answer: 'We offer Standard (3–5 business days, FREE over $80), Express (1–2 business days, $18), and Overnight (next business day, $32). All orders ship from our fulfillment center and include tracking. International shipping is available to select countries — rates calculated at checkout.'
    },
    {
      id: 4,
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also view tracking information in your account dashboard under Orders. Most orders are processed within 1–2 business days. If you haven\'t received tracking within 3 business days, contact support.'
    },
    {
      id: 5,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), Apple Pay, Shop Pay, PayPal, and Afterpay. All transactions are encrypted and secure. We do not store your payment information — it\'s processed through Stripe.'
    },
    {
      id: 6,
      question: 'Do you offer gift cards?',
      answer: 'Yes. Digital gift cards are available in $25, $50, $100, and $200 denominations. They\'re delivered via email and can be redeemed at checkout. Gift cards never expire and can be combined with promo codes.'
    },
    {
      id: 7,
      question: 'Can I cancel or modify my order?',
      answer: 'Orders can be canceled or modified within 1 hour of placement. After that, they enter fulfillment and cannot be changed. If you need to cancel, email orders@dashop.com immediately with your order number. Refunds are issued to the original payment method within 5–7 business days.'
    },
    {
      id: 8,
      question: 'What is your sustainability policy?',
      answer: 'We partner with brands that prioritize quality over quantity. All garments are made to last, reducing waste from fast fashion. Many of our brands use organic cotton, recycled materials, or low-impact dyes. Packaging is minimal and recyclable. We\'re continuously working to reduce our environmental footprint.'
    }
  ]

  function handleSubmit(e) {
    e.preventDefault()
    alert('Message sent. We\'ll respond within 24 hours.')
    setFormData({ name: '', email: '', orderNumber: '', message: '' })
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-ink mb-8" />
          <p className="text-mute text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            Support
          </p>
          <h1
            className="text-ink font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em' }}
          >
            How Can We Help?
          </h1>
        </div>
      </div>

      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* LEFT: FAQ Accordion */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-ink font-black uppercase text-xl mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-mute text-sm">
                Find answers to common questions below. Can't find what you need? Use the contact form.
              </p>
            </div>

            <div className="flex flex-col gap-px bg-rule">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-paper/50 transition-colors"
                  >
                    <span className="text-ink font-bold text-sm uppercase tracking-wide pr-4">
                      {faq.question}
                    </span>
                    <span className="text-ink text-xl flex-shrink-0">
                      {openFaq === faq.id ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-rule">
                      <p className="text-mute text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-8 p-6 border border-rule bg-paper">
              <p className="text-ink text-[10px] tracking-[0.2em] uppercase font-black mb-4">
                Helpful Links
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/shipping" className="text-ink text-sm hover:underline">
                  Shipping Policy
                </Link>
                <Link to="/returns" className="text-ink text-sm hover:underline">
                  Returns & Exchanges
                </Link>
                <Link to="/terms" className="text-ink text-sm hover:underline">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-ink text-sm hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact form (sticky) */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white border border-rule">
              <div className="px-6 py-5 border-b border-rule bg-paper">
                <h3 className="text-ink font-black uppercase text-lg">
                  Contact Us
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-ink text-[10px] tracking-[0.2em] uppercase font-semibold">
                    Your Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="border border-rule px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-ink text-[10px] tracking-[0.2em] uppercase font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="you@email.com"
                    className="border border-rule px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-ink text-[10px] tracking-[0.2em] uppercase font-semibold">
                    Order Number <span className="text-mute font-normal normal-case tracking-normal text-xs">(optional)</span>
                  </label>
                  <input
                    value={formData.orderNumber}
                    onChange={e => setFormData({...formData, orderNumber: e.target.value})}
                    placeholder="DA-000000"
                    className="border border-rule px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-ink text-[10px] tracking-[0.2em] uppercase font-semibold">
                    Message
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Describe your issue or question..."
                    rows={6}
                    className="border border-rule px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors bg-white resize-vertical"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-ink text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-ink/80 transition-colors"
                >
                  Send Message
                </button>

                <p className="text-mute text-[10px] tracking-[0.15em] uppercase text-center">
                  We respond within 24 hours
                </p>
              </form>
            </div>

            {/* Direct contact info */}
            <div className="mt-6 p-6 border border-rule bg-white">
              <p className="text-ink text-[10px] tracking-[0.2em] uppercase font-black mb-4">
                Other Ways to Reach Us
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-mute text-[9px] tracking-[0.15em] uppercase mb-1">
                    Email
                  </p>
                  <a href="mailto:support@dashop.com" className="text-ink text-sm hover:underline">
                    support@dashop.com
                  </a>
                </div>
                <div>
                  <p className="text-mute text-[9px] tracking-[0.15em] uppercase mb-1">
                    Hours
                  </p>
                  <p className="text-ink text-sm">
                    Mon–Fri 9AM–6PM PST
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
