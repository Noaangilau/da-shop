import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-10 h-px bg-midnight mx-auto mb-10" />
        <p className="text-muted text-[10px] tracking-[0.4em] uppercase mb-4">404</p>
        <h1
          className="text-midnight font-black uppercase mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.04em' }}
        >
          Page Not Found
        </h1>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
