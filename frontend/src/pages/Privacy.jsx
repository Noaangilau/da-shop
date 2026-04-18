import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `When you create an account or place an order we collect your name, email address, phone number, and shipping address. We also collect order history and cart data to improve your experience. We do not store full payment card details — payments are processed by Stripe.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to process orders, send order confirmations and updates, provide customer support, and improve the Platform. With your consent we may send marketing emails about new drops and vendor launches. You can unsubscribe at any time.`,
  },
  {
    title: '3. Sharing Your Information',
    body: `We share your shipping name and address with the relevant vendor so they can fulfil your order. We do not sell your personal data to third parties. We use trusted third-party services including Stripe (payments), Resend (email), and Twilio (SMS) — each bound by their own privacy policies.`,
  },
  {
    title: '4. Data Retention',
    body: `We retain your account data for as long as your account is active. Order records are retained for seven years for accounting and legal compliance. You may request deletion of your account at any time by emailing hello@dashop.co.nz.`,
  },
  {
    title: '5. Cookies',
    body: `DA SHOP uses session cookies to keep you logged in and remember your cart. We do not use third-party tracking or advertising cookies. You can disable cookies in your browser settings, but some features may not function correctly.`,
  },
  {
    title: '6. Security',
    body: `We implement industry-standard security measures including HTTPS encryption and hashed password storage. Despite these measures, no internet transmission is 100% secure. Please keep your account credentials confidential.`,
  },
  {
    title: '7. Your Rights',
    body: `You have the right to access, correct, or delete your personal data. To exercise these rights email hello@dashop.co.nz. We will respond within 30 days. If you are an EU/UK resident you may also have rights under GDPR.`,
  },
  {
    title: '8. Changes to this Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Last updated: April 2026.`,
  },
]

export default function Privacy() {
  return (
    <main className="pt-[88px] min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-semibold mb-4">Legal</p>
        <h1 className="text-midnight font-black uppercase tracking-wide mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Privacy Policy
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
          <Link to="/terms" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Terms of Service</Link>
          <Link to="/returns" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Returns Policy</Link>
          <Link to="/shipping" className="text-muted text-[11px] tracking-[0.12em] uppercase hover:text-midnight transition-colors">Shipping Info</Link>
        </div>
      </div>
    </main>
  )
}
