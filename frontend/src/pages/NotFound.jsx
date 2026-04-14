import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="pt-16 min-h-screen bg-midnight flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-px bg-white mx-auto mb-10" />
        <p className="text-white/30 text-xs tracking-widest uppercase mb-4">404</p>
        <h1 className="text-white text-4xl font-black uppercase tracking-wide mb-4">
          Page Not Found
        </h1>
        <p className="text-white/40 text-base mb-10">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-white text-midnight font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-white/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
