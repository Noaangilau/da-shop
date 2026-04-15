import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-12 h-px bg-midnight mx-auto mb-10" />
        <p className="text-muted text-xs tracking-widest uppercase mb-4">404</p>
        <h1 className="text-midnight text-4xl font-black uppercase tracking-wide mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-midnight text-white font-black text-xs tracking-widest uppercase px-10 py-4 hover:bg-midnight/80 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
