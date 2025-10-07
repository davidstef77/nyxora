"use client"

export default function OffersList({ offers = [], affiliateLinks = [] }) {
  if ((!offers || offers.length === 0) && (!affiliateLinks || affiliateLinks.length === 0)) {
    return <div className="text-slate-400">Nu există oferte asociate acestui produs.</div>
  }

  return (
    <div className="space-y-3">
      {offers && offers.length > 0 && offers.map((o, idx) => (
        <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-slate-800/60 to-slate-800/40 p-4 rounded-2xl shadow-sm ring-1 ring-white/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold">{String(o.priceValue).slice(0,1)}</div>
            <div>
              <div className="text-sm text-white">Oferta furnizor</div>
              <div className="font-semibold text-lg text-white">{o.priceValue} {o.priceCurrency || 'RON'}</div>
              {o.affiliateUrl && <div className="text-sm text-white truncate mt-1"><a href={o.affiliateUrl} target="_blank" rel="noreferrer" className="underline text-white">Vezi detalii furnizor</a></div>}
            </div>
          </div>
          <div>
            {o.affiliateUrl ? (
              <a href={o.affiliateUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg shadow bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 text-white">Vezi ofertă</a>
            ) : (
              <button disabled className="px-4 py-2 bg-slate-600 text-white rounded-lg opacity-60">Fără link</button>
            )}
          </div>
        </div>
      ))}

      {affiliateLinks && affiliateLinks.length > 0 && affiliateLinks.map((a, idx) => (
        <div key={`a-${idx}`} className="flex items-center justify-between bg-gradient-to-r from-slate-800/60 to-slate-800/40 p-4 rounded-2xl shadow-sm ring-1 ring-white/5">
          <div>
            <div className="text-sm text-white">{a.storeName || 'Furnizor'}</div>
            <div className="font-semibold text-lg text-white">{a.price || '—'}</div>
          </div>
          <div>
            {a.url ? (
              <a href={a.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg shadow bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 text-white">Vezi ofertă</a>
            ) : (
              <button disabled className="px-4 py-2 bg-slate-600 text-white rounded-lg opacity-60">Fără link</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
