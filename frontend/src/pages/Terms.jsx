import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using DA SHOP ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the Platform.`,
  },
  {
    title: '2. Use of the Platform',
    body: `DA SHOP is a Pacific Islander marketplace connecting independent vendors with customers. You agree to use the Platform only for lawful purposes. You must not use the Platform to transmit any material that is unlawful, harmful, threatening, abusive, or otherwise objectionable.`,
  },
  {
    title: '3. Accounts',
    body: `To purchase on DA SHOP you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use at hello@dashop.co.nz.`,
  },
  {
    title: '4. Orders & Payment',
    body: `All orders are subject to product availability. Prices are listed in NZD unless otherwise stated. Payment is processed securely via Stripe. By placing an order you authorise DA SHOP to charge your payment method for the total order amount.`,
  },
  {
    title: '5. Vendor Responsibility',
    body: `Each vendor on DA SHOP is an independent business. DA SHOP facilitates sales but is not the seller of record for vendor products. Vendors are responsible for the accuracy of their product listings, fulfilment, and any warranties.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All content on the Platform — including brand assets, product images, and text — is the property of DA SHOP or its vendors. You may not reproduce, distribute, or create derivative works without written permission.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `DA SHOP is provided "as is" without warranties of any kind. To the fullest extent permitted by law, DA SHOP and its operators will not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.`,
  },
  {
    title: '8. Changes to Terms',
    body: `We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms. Last updated: April 2026.`,
  },
  {
    title: '9. Contact',
    body: `Questions about these terms? Email us at hello@dashop.co.nz.`,
  },
]

export default function Terms() {
  return (
    <main className="pt-[88px] min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">Legal</p>
        <h1 className="text-midnight font-black uppercase tracking-wide mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Terms of Service
        </h1>
        <p className="text-muted text-sm mb-16">Last updated April 2026</p>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => (
            <div key={s.title} className="border-t border-[#E5E5E5] pt-8">
              <h2 className="text-midnight font-black uppercase tracking-wide text-sm mb-4">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6">
          <Link to="/privacy" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Privacy Policy</Link>
          <Link to="/returns" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Returns Policy</Link>
          <Link to="/shipping" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Shipping Info</Link>
        </div>
      </div>
    </main>
  )
}
