import { Link } from 'react-router-dom'

const RATES = [
  { zone: 'New Zealand', standard: '3–5 business days', express: '1–2 business days', standardCost: '$6.50', expressCost: '$14.00', free: 'Free on orders over $150' },
  { zone: 'Australia', standard: '6–10 business days', express: '3–5 business days', standardCost: '$14.00', expressCost: '$28.00', free: 'Free on orders over $250' },
  { zone: 'Pacific Islands', standard: '7–14 business days', express: '—', standardCost: '$18.00', expressCost: '—', free: '' },
  { zone: 'USA & Canada', standard: '10–18 business days', express: '—', standardCost: '$22.00', expressCost: '—', free: '' },
  { zone: 'UK & Europe', standard: '12–20 business days', express: '—', standardCost: '$24.00', expressCost: '—', free: '' },
  { zone: 'Rest of World', standard: '14–25 business days', express: '—', standardCost: '$26.00', expressCost: '—', free: '' },
]

const SECTIONS = [
  {
    title: 'Processing Time',
    body: `All orders are processed within 1–3 business days after payment confirmation. During high-demand periods (e.g., limited drops, holidays) processing may take up to 5 business days. You will receive an email confirmation once your order has been dispatched.`,
  },
  {
    title: 'Tracking Your Order',
    body: `A tracking number will be emailed to you once your order ships. You can track your parcel directly with the courier using the link in your confirmation email. Tracking updates may take 24 hours to appear after dispatch.`,
  },
  {
    title: 'Customs & Duties (International)',
    body: `International orders may be subject to customs duties, taxes, and fees imposed by your country. These charges are the buyer's responsibility and are not included in the order total. DA SHOP has no control over these charges and cannot predict their amount.`,
  },
  {
    title: 'Lost or Delayed Parcels',
    body: `If your parcel hasn't arrived within the estimated timeframe, please first check your tracking link. If there are no updates for more than 5 business days, contact us at hello@dashop.co.nz with your order number and we will investigate with the courier.`,
  },
  {
    title: 'Incorrect Address',
    body: `Please ensure your shipping address is accurate before completing checkout. DA SHOP is not responsible for orders delivered to an incorrect address provided by the customer. If you notice an error, contact us immediately at hello@dashop.co.nz — we can update the address if your order hasn't shipped yet.`,
  },
]

export default function Shipping() {
  return (
    <main className="pt-[88px] min-h-screen bg-white">
      <div className="max-w-[900px] mx-auto px-6 py-20">
        <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">Support</p>
        <h1 className="text-midnight font-black uppercase tracking-wide mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Shipping Info
        </h1>
        <p className="text-muted text-sm mb-16">Ships from New Zealand · All prices in NZD</p>

        {/* Rates table */}
        <div className="mb-20">
          <h2 className="text-midnight font-black uppercase tracking-wide text-sm mb-6 border-t border-[#E5E5E5] pt-8">
            Shipping Rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[#E5E5E5]">
              <thead>
                <tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                  <th className="text-left px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-muted font-semibold">Zone</th>
                  <th className="text-left px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-muted font-semibold">Standard</th>
                  <th className="text-left px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-muted font-semibold">Express</th>
                  <th className="text-left px-5 py-3 text-[10px] tracking-[0.2em] uppercase text-muted font-semibold">Free Shipping</th>
                </tr>
              </thead>
              <tbody>
                {RATES.map((r, i) => (
                  <tr key={r.zone} className={`border-b border-[#E5E5E5] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F7]/50'}`}>
                    <td className="px-5 py-4 text-midnight font-bold text-[13px]">{r.zone}</td>
                    <td className="px-5 py-4 text-gray-500 text-[13px]">
                      <div>{r.standardCost}</div>
                      <div className="text-[11px] text-muted mt-0.5">{r.standard}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-[13px]">
                      {r.expressCost !== '—' ? (
                        <>
                          <div>{r.expressCost}</div>
                          <div className="text-[11px] text-muted mt-0.5">{r.express}</div>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-[13px]">
                      {r.free ? <span className="text-midnight font-semibold text-[12px]">{r.free}</span> : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info sections */}
        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => (
            <div key={s.title} className="border-t border-[#E5E5E5] pt-8">
              <h2 className="text-midnight font-black uppercase tracking-wide text-sm mb-4">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6">
          <Link to="/returns" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Returns Policy</Link>
          <Link to="/terms" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </main>
  )
}
