import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Our Returns Policy',
    body: `We want you to love what you ordered. If something isn't right, we'll work with you to make it right. Please read the policy below before contacting us.`,
  },
  {
    title: 'Eligible Items',
    body: `Items are eligible for return within 14 days of delivery if they are unused, unworn, and in original packaging with all tags attached. The following are not eligible: custom or personalised items, digital downloads, art services, and final-sale items marked as non-returnable at the time of purchase.`,
  },
  {
    title: 'How to Start a Return',
    body: `Email hello@dashop.co.nz with your order number, the item(s) you wish to return, and the reason for the return. We will respond within 2 business days with return instructions. Do not send items back before receiving a return authorisation.`,
  },
  {
    title: 'Condition of Returns',
    body: `Items must be returned in the same condition you received them — unworn, unwashed, and with original tags. Items that show signs of use, damage, or alteration will not be accepted and will be returned to you at your cost.`,
  },
  {
    title: 'Refunds',
    body: `Once we receive and inspect your return, we will notify you by email. Approved refunds are processed to your original payment method within 5–10 business days. Original shipping costs are non-refundable unless the return is due to a defective or incorrect item.`,
  },
  {
    title: 'Exchanges',
    body: `We do not process direct exchanges. If you need a different size or colour, return the original item and place a new order. This ensures availability and the fastest possible turnaround.`,
  },
  {
    title: 'Damaged or Incorrect Items',
    body: `If you receive a damaged, defective, or incorrect item please email hello@dashop.co.nz within 48 hours of delivery with photos. We will cover return shipping and send a replacement or full refund at no cost to you.`,
  },
  {
    title: 'Return Shipping Costs',
    body: `Unless the return is due to an error or defect on our part, return shipping costs are the buyer's responsibility. We recommend using a tracked service as we cannot accept responsibility for returns that do not arrive.`,
  },
]

export default function Returns() {
  return (
    <main className="pt-[88px] min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">Support</p>
        <h1 className="text-midnight font-black uppercase tracking-wide mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Returns & Refunds
        </h1>
        <p className="text-muted text-sm mb-16">14-day returns on eligible items</p>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => (
            <div key={s.title} className="border-t border-[#E5E5E5] pt-8">
              <h2 className="text-midnight font-black uppercase tracking-wide text-sm mb-4">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#F7F7F7] border border-[#E5E5E5] p-8">
          <p className="text-muted text-[10px] tracking-[0.3em] uppercase font-semibold mb-3">Need help?</p>
          <p className="text-midnight font-black uppercase tracking-wide text-sm mb-4">Contact Our Team</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            For any returns, refunds, or order issues email us at <span className="text-midnight font-semibold">hello@dashop.co.nz</span> — we typically respond within 1 business day.
          </p>
          <Link
            to="/become-a-vendor"
            className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.12em] uppercase px-8 py-3 hover:bg-midnight/80 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6">
          <Link to="/shipping" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Shipping Info</Link>
          <Link to="/terms" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </main>
  )
}
