import { useState } from 'react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    id: 1,
    question: 'What are your sizing guidelines?',
    answer: "All DA SHOP garments are sized true-to-fit. We recommend ordering your usual size. For a more relaxed fit, size up one. Measurements for each product are available on the product detail page. If you're between sizes, we suggest sizing up for heavier items."
  },
  {
    id: 2,
    question: 'How do I return or exchange an item?',
    answer: "We accept returns within 30 days of delivery for unworn, unwashed items with tags attached. Start a return from your account dashboard or email returns@dashop.com with your order number. Exchanges are processed as returns + new orders."
  },
  {
    id: 3,
    question: 'What shipping options do you offer?',
    answer: 'We offer Standard (3–5 business days) and Express (1–2 business days) shipping. All orders include tracking. International shipping is available to select countries — rates calculated at checkout.'
  },
  {
    id: 4,
    question: 'How do I track my order?',
    answer: "Once your order ships, you'll receive a tracking number via email. You can also view tracking in your account dashboard under Orders. Most orders are processed within 1–2 business days."
  },
  {
    id: 5,
    question: 'What payment methods do you accept?',
    answer: "We accept all major credit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and PayPal. All transactions are encrypted and processed through Stripe."
  },
  {
    id: 6,
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be canceled or modified within 1 hour of placement. After that, they enter fulfillment and cannot be changed. Email orders@dashop.com immediately with your order number.'
  },
  {
    id: 7,
    question: 'Do you do school or group orders?',
    answer: 'Yes — we partner with schools to build official school stores. Visit the Schools section to see current partners or apply for your school. Bulk pricing is available for group orders of 10+.'
  },
  {
    id: 8,
    question: 'How do I become a vendor on DA SHOP?',
    answer: 'Artists and brands can apply to sell on DA SHOP. Visit the Become a Vendor page and fill out the application. Our team reviews each application and will reach out within 5–7 business days.'
  },
]

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
    setFormData({ name: '', email: '', orderNumber: '', message: '' })
  }

  return (
    <main className="pt-[88px] bg-white min-h-screen">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-midnight mb-8" />
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">
            Support
          </p>
          <h1
            className="text-midnight font-black uppercase"
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
              <h2 className="text-midnight font-black uppercase text-xl mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted text-sm">
                Find answers below. Can't find what you need? Use the contact form.
              </p>
            </div>

            <div className="flex flex-col gap-px bg-[#E5E5E5]">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-[#F7F7F7] transition-colors"
                  >
                    <span className="text-midnight font-bold text-sm uppercase tracking-wide pr-4">
                      {faq.question}
                    </span>
                    <span className="text-midnight text-xl flex-shrink-0">
                      {openFaq === faq.id ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#E5E5E5]">
                      <p className="text-muted text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-8 p-6 border border-[#E5E5E5] bg-[#F7F7F7]">
              <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-black mb-4">
                Helpful Links
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Shipping Policy',      to: '/shipping' },
                  { label: 'Returns & Exchanges',  to: '/returns' },
                  { label: 'Terms of Service',     to: '/terms' },
                  { label: 'Privacy Policy',       to: '/privacy' },
                  { label: 'Become a Vendor',      to: '/become-a-vendor' },
                  { label: 'School Partnerships',  to: '/schools' },
                ].map((link) => (
                  <Link key={link.label} to={link.to} className="text-midnight text-sm hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Contact form (sticky) */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white border border-[#E5E5E5]">
              <div className="px-6 py-5 border-b border-[#E5E5E5] bg-[#F7F7F7]">
                <h3 className="text-midnight font-black uppercase text-lg">Contact Us</h3>
              </div>

              {sent ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-px bg-midnight mx-auto mb-6" />
                  <p className="text-midnight font-black uppercase text-sm mb-2">Message Sent</p>
                  <p className="text-muted text-xs">We'll respond within 24 hours.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 text-muted text-[10px] tracking-[0.15em] uppercase hover:text-midnight transition-colors"
                  >
                    Send Another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                  {[
                    { key: 'name',        label: 'Your Name',      type: 'text',  required: true,  placeholder: 'Jane Doe' },
                    { key: 'email',       label: 'Email Address',  type: 'email', required: true,  placeholder: 'you@email.com' },
                    { key: 'orderNumber', label: 'Order Number',   type: 'text',  required: false, placeholder: 'DS-0000' },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                        {f.label}{' '}
                        {!f.required && (
                          <span className="text-muted font-normal normal-case tracking-normal text-xs">(optional)</span>
                        )}
                      </label>
                      <input
                        type={f.type}
                        required={f.required}
                        value={formData[f.key]}
                        placeholder={f.placeholder}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-midnight text-[10px] tracking-[0.2em] uppercase font-semibold">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      placeholder="Describe your issue or question..."
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border border-[#E5E5E5] px-4 py-3 text-sm text-midnight focus:outline-none focus:border-midnight transition-colors bg-white resize-vertical"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-midnight/80 transition-colors"
                  >
                    Send Message
                  </button>
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase text-center">
                    We respond within 24 hours
                  </p>
                </form>
              )}
            </div>

            <div className="mt-6 p-6 border border-[#E5E5E5] bg-white">
              <p className="text-midnight text-[10px] tracking-[0.2em] uppercase font-black mb-4">
                Other Ways to Reach Us
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-muted text-[9px] tracking-[0.15em] uppercase mb-1">Email</p>
                  <a href="mailto:support@dashop.com" className="text-midnight text-sm hover:underline">
                    support@dashop.com
                  </a>
                </div>
                <div>
                  <p className="text-muted text-[9px] tracking-[0.15em] uppercase mb-1">Hours</p>
                  <p className="text-midnight text-sm">Mon–Fri 9AM–6PM</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </section>
    </main>
  )
}
