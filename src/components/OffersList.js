"use client"

export default function OffersList({ offers = [], affiliateLinks = [] }) {
  const hasOffers = Array.isArray(offers) && offers.length > 0
  const hasAffiliates = Array.isArray(affiliateLinks) && affiliateLinks.length > 0

  if (!hasOffers && !hasAffiliates) {
    return <div className="text-xs text-gray-400">Nu există oferte pentru acest produs.</div>
  }

  return (
    <div className="space-y-2">
      {hasOffers && offers.map((o, idx) => (
        <div
          key={idx}
          className="group flex items-center justify-between rounded-lg border border-gray-800 bg-black/20 p-3 hover:border-gray-600 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {o.priceValue} {o.priceCurrency || 'RON'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {o.affiliateUrl ? (
              <a
                href={o.affiliateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 transition"
              >
                Vezi ofertă<span aria-hidden>→</span>
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-md border border-gray-700 text-gray-400 text-xs px-3 py-1.5 opacity-60"
              >
                Fără link
              </button>
            )}
          </div>
        </div>
      ))}

      {hasAffiliates && affiliateLinks.map((a, idx) => (
        <div
          key={`a-${idx}`}
          className="group flex items-center justify-between rounded-lg border border-gray-800 bg-black/20 p-3 hover:border-gray-600 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-xs text-gray-400 truncate">{a.storeName || 'Furnizor'}</div>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-purple-600/40 text-purple-300">Afiliat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-white">{a.price || '—'}</div>
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 transition"
              >
                Vezi ofertă<span aria-hidden>→</span>
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-md border border-gray-700 text-gray-400 text-xs px-3 py-1.5 opacity-60"
              >
                Fără link
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
