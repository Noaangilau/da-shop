import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Handles popup announcements only (banner is rendered inside Navbar to
 * avoid overlap with the fixed-position nav). Shows at most one unseen
 * popup, dismissible and remembered per visitor via localStorage.
 */
export default function AnnouncementPopup() {
  const [popup, setPopup] = useState(null)
  const [open, setOpen]   = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/announcements/active`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        const pop = data.find(
          (a) =>
            (a.display_mode === 'popup' || a.display_mode === 'both') &&
            !localStorage.getItem(`ann-popup-seen-${a.id}`)
        )
        if (pop) {
          setPopup(pop)
          const t = setTimeout(() => setOpen(true), 2000)
          return () => clearTimeout(t)
        }
      })
      .catch(() => {})
  }, [])

  function close() {
    if (popup) localStorage.setItem(`ann-popup-seen-${popup.id}`, '1')
    setOpen(false)
  }

  if (!open || !popup) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6"
      onClick={close}
    >
      <div
        className="bg-white max-w-md w-full p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 text-muted hover:text-midnight text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <div className="w-8 h-px bg-midnight mb-6" />
        <h3 className="text-midnight font-black uppercase tracking-wide text-2xl mb-4">
          {popup.title}
        </h3>
        {popup.body && (
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{popup.body}</p>
        )}
        {popup.cta_url && (
          <a
            href={popup.cta_url}
            className="inline-block bg-midnight text-white font-black text-[11px] tracking-[0.15em] uppercase px-8 py-3 hover:bg-midnight/80 transition-colors"
          >
            {popup.cta_label || 'Shop now'}
          </a>
        )}
      </div>
    </div>
  )
}
