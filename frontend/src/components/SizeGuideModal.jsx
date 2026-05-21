const sizeData = [
  { size: 'M',   chest: '20"', body: '27"', sleeve: '8.5"' },
  { size: 'L',   chest: '22"', body: '28"', sleeve: '9"'   },
  { size: 'XL',  chest: '24"', body: '29"', sleeve: '9.5"' },
  { size: '2XL', chest: '26"', body: '30"', sleeve: '10"'  },
  { size: '3XL', chest: '28"', body: '31"', sleeve: '10.5"'},
]

export default function SizeGuideModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mute hover:text-ink text-2xl leading-none transition-colors"
          aria-label="Close size guide"
        >
          ×
        </button>

        <div className="w-8 h-px bg-ink mb-6" />
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute mb-2">
          Clothing
        </p>
        <h3 className="text-ink font-black uppercase tracking-wide text-2xl mb-2">
          Size Guide
        </h3>
        <p className="text-mute text-xs mb-8 leading-relaxed">
          Measurements in inches. Chest width measured flat across the chest below the armhole.
          All garments are pre-shrunk heavyweight construction.
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-rule">
              <th className="text-left font-mono text-[10px] tracking-[0.15em] uppercase text-mute pb-3 pr-6">Size</th>
              <th className="text-left font-mono text-[10px] tracking-[0.15em] uppercase text-mute pb-3 pr-6">Chest Width</th>
              <th className="text-left font-mono text-[10px] tracking-[0.15em] uppercase text-mute pb-3 pr-6">Body Length</th>
              <th className="text-left font-mono text-[10px] tracking-[0.15em] uppercase text-mute pb-3">Sleeve Length</th>
            </tr>
          </thead>
          <tbody>
            {sizeData.map((row, i) => (
              <tr
                key={row.size}
                className={`border-b border-rule/50 ${i % 2 === 0 ? 'bg-paper/40' : ''}`}
              >
                <td className="py-3 pr-6 font-black text-ink text-sm">{row.size}</td>
                <td className="py-3 pr-6 font-mono text-sm text-ink">{row.chest}</td>
                <td className="py-3 pr-6 font-mono text-sm text-ink">{row.body}</td>
                <td className="py-3 font-mono text-sm text-ink">{row.sleeve}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-8 font-mono text-[10px] tracking-[0.1em] uppercase text-mute">
          All styles fit true-to-size. Size up for an oversized fit.
        </p>
      </div>
    </div>
  )
}
