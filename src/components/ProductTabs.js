"use client"

import { useState } from 'react'

export default function ProductTabs({ description = '', specs = {}, benchmarks = [] }) {
  const [tab, setTab] = useState('description')

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-4 rounded-2xl shadow-lg ring-1 ring-white/5">
      <div className="flex gap-3 mb-4">
  <button onClick={() => setTab('description')} className={`px-3 py-2 rounded ${tab==='description' ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white' : 'bg-slate-800 text-white'}`}>Descriere</button>
  <button onClick={() => setTab('specs')} className={`px-3 py-2 rounded ${tab==='specs' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-slate-800 text-white'}`}>Specificații</button>
  <button onClick={() => setTab('reviews')} className={`px-3 py-2 rounded ${tab==='reviews' ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white' : 'bg-slate-800 text-white'}`}>Recenzii</button>
  <button onClick={() => setTab('benchmark')} className={`px-3 py-2 rounded ${tab==='benchmark' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' : 'bg-slate-800 text-white'}`}>Benchmark</button>
      </div>

      <div>
        {tab === 'description' && (
          <div className="text-slate-300 leading-relaxed">{description || 'Nu există descriere disponibilă.'}</div>
        )}

        {tab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(specs || {}).length === 0 ? (
              <div className="text-slate-400">Specificații indisponibile.</div>
            ) : (
              Object.entries(specs).map(([k,v]) => (
                <div key={k} className="p-3 bg-slate-800/60 rounded flex justify-between">
                  <div className="text-slate-300">{k}</div>
                  <div className="text-slate-200 font-medium">{String(v)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="text-slate-400">Nicio recenzie încă. Fii primul care scrie o părere!</div>
        )}

        {tab === 'benchmark' && (
          <div>
            {(!benchmarks || benchmarks.length === 0) ? (
              <div className="text-slate-400">Nu există benchmark-uri pentru acest produs încă.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {benchmarks.map((b, i) => (
                  <div key={i} className="p-3 bg-slate-800/60 rounded">
                    { (b.image || b.imageUrl) && (
                      <img src={b.image || b.imageUrl} alt={b.title || `benchmark-${i}`} className="w-full h-40 object-cover rounded mb-3" />
                    )}

                    {b.title && <div className="text-slate-200 font-semibold mb-1">{b.title}</div>}

                    {b.text || b.content ? (
                      <div className="text-slate-300 leading-relaxed">{b.text || b.content}</div>
                    ) : (!b.image && !b.title) ? (
                      <div className="text-slate-400">Benchmark necompletat.</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
