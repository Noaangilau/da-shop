import { Link } from 'react-router-dom'
import { schools } from '../data/schools'

const COMING_SOON_COUNT = Math.max(0, 3 - schools.length)

function SchoolCard({ school }) {
  return (
    <Link
      to={`/school/${school.id}`}
      className="group relative overflow-hidden aspect-square block"
      style={{ background: school.colors.primary }}
    >
      {/* diagonal stripe texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,0.06) 22px 23px)',
        }}
      />
      {/* secondary color bar */}
      <div
        className="absolute top-0 right-0 h-full w-[30%]"
        style={{ background: school.colors.secondary, opacity: 0.95 }}
      />
      <div className="relative p-6 h-full flex flex-col justify-between" style={{ color: school.colors.primaryInk }}>
        <div className="flex justify-between items-start">
          <span className="text-[10px] tracking-[0.14em] uppercase font-mono opacity-80">{school.since}</span>
          <span
            className="text-[10px] tracking-[0.14em] uppercase font-mono"
            style={{ color: school.colors.secondary === '#111111' ? '#fff' : school.colors.secondary }}
          >
            {school.mascot}
          </span>
        </div>
        <div>
          <h2 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', letterSpacing: '0.04em' }}>
            {school.shortName}
          </h2>
          <p className="text-[11px] tracking-[0.14em] uppercase font-mono mt-2 opacity-80">
            {school.productCount > 0 ? `${school.productCount} ITEMS · ` : ''}OFFICIAL STORE
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[10px] tracking-[0.12em] uppercase font-mono opacity-80">{school.location}</span>
          <span className="text-[11px] tracking-[0.14em] uppercase font-mono group-hover:translate-x-1 transition-transform">SHOP →</span>
        </div>
      </div>
    </Link>
  )
}

function ComingSoonCard({ index }) {
  return (
    <div className="aspect-square border border-dashed border-rule p-6 flex flex-col justify-between bg-paper">
      <span className="text-mute text-[10px] tracking-[0.14em] uppercase font-mono">
        SCHOOL / 0{schools.length + index + 1}
      </span>
      <div>
        <p className="text-mute font-black uppercase" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '0.04em', lineHeight: 1 }}>
          COMING<br />SOON.
        </p>
      </div>
      <span className="text-mute text-[10px] tracking-[0.12em] uppercase font-mono">
        YOUR SCHOOL?<br />APPLY BELOW →
      </span>
    </div>
  )
}

export default function Schools() {
  return (
    <main className="bg-white min-h-screen">

      {/* ── Header ── */}
      <div className="bg-white border-b border-rule">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="w-8 h-px bg-ink mb-8" />
          <p className="text-mute text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
            School + Club Stores
          </p>
          <h1
            className="text-ink font-black uppercase"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)', letterSpacing: '0.04em', lineHeight: 0.95 }}
          >
            Schools.
          </h1>
          <p className="text-mute text-sm leading-relaxed mt-5 max-w-2xl">
            Official school stores. We partner with schools to produce a small catalog of school-branded basics — tees, long sleeves, crew necks, and hoodies — in your colors, with your mark, shipped direct.
          </p>
        </div>
      </div>

      {/* ── Schools grid ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <p className="text-mute text-[10px] tracking-[0.4em] uppercase font-semibold mb-6">
          Current Partners · {String(schools.length).padStart(2, '0')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-rule">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
          {Array.from({ length: COMING_SOON_COUNT }).map((_, i) => (
            <ComingSoonCard key={i} index={i} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-paper border-t border-b border-rule py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-mute text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">How It Works</p>
          <h2
            className="text-ink font-black uppercase mb-12"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em' }}
          >
            From Sample to Shipped.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule">
            {[
              ['01', 'DESIGN', 'Bring your school mark, your colors, your fits. We finalize a small catalog — usually 4–6 items: a tee, long sleeve, crew, hoodie.'],
              ['02', 'OPEN STORE', "We build a dedicated school page in DA SHOP. Students, families, and supporters order direct — no order forms, no chasing payments."],
              ['03', 'SHIP', 'We produce in batches and ship direct. Reorders open every season.'],
            ].map(([num, title, body]) => (
              <div key={num} className="bg-white p-8">
                <p className="text-mute text-[10px] tracking-[0.2em] uppercase font-mono mb-4">STEP / {num}</p>
                <h3 className="text-ink font-black uppercase text-xl mb-3">{title}</h3>
                <p className="text-mute text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apply CTA ── */}
      <section className="bg-ink py-20 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">
              For Principals · Student Councils · Coaches
            </p>
            <h2
              className="text-white font-black uppercase"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '0.04em' }}
            >
              Bring Your School.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mt-4 max-w-md">
              We're rolling out school stores one at a time. Submit your school for the next batch.
            </p>
          </div>
          <Link
            to="/become-a-vendor"
            className="flex-shrink-0 bg-white text-ink font-black text-[11px] tracking-[0.15em] uppercase px-12 py-4 hover:bg-white/90 transition-colors"
          >
            Apply for Your School →
          </Link>
        </div>
      </section>

    </main>
  )
}
