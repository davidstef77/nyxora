"use client"

import { useState } from 'react'

export default function ProductTabs({ description = '', specs = {}, benchmarks = [] }) {
  const [tab, setTab] = useState('description')

  return (
    <div className="rounded-lg border border-gray-800 p-2">
      <div className="flex gap-3 mb-2 border-b border-gray-800">
  <button onClick={() => setTab('description')} className={`px-1.5 py-1 text-xs ${tab==='description' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'}`}>Descriere</button>
  <button onClick={() => setTab('specs')} className={`px-1.5 py-1 text-xs ${tab==='specs' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'}`}>Specificații</button>
  <button onClick={() => setTab('reviews')} className={`px-1.5 py-1 text-xs ${tab==='reviews' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'}`}>Recenzii</button>
  <button onClick={() => setTab('benchmark')} className={`px-1.5 py-1 text-xs ${tab==='benchmark' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-gray-200'}`}>Benchmark</button>
      </div>

      <div>
        {tab === 'description' && (
          <div className="text-xs text-gray-300">{description || 'Nu există descriere disponibilă.'}</div>
        )}

        {tab === 'specs' && (
          <div className="space-y-1">
            {Object.keys(specs || {}).length === 0 ? (
              <div className="text-xs text-gray-400">Specificații indisponibile.</div>
            ) : (
              Object.entries(specs).map(([k,v]) => (
                <div key={k} className="p-1 bg-gray-700 rounded flex justify-between">
                  <div className="text-xs text-gray-300">{k}</div>
                  <div className="text-xs text-white">{String(v)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="text-xs text-gray-400">Nicio recenzie încă.</div>
        )}

        {tab === 'benchmark' && (
          <div>
            {(!benchmarks || benchmarks.length === 0) ? (
              <div className="text-xs text-gray-400">Nu există benchmark-uri pentru acest produs.</div>
            ) : (
              <div className="space-y-2">
                {benchmarks.map((b, i) => (
                  <div key={i} className="p-2 bg-gray-700 rounded">
                    { (b.image || b.imageUrl) && (
                      <img src={b.image || b.imageUrl} alt={b.title || `benchmark-${i}`} className="w-full h-20 object-cover rounded mb-1" />
                    )}

                    {b.title && <div className="text-xs text-white font-medium mb-1">{b.title}</div>}

                    {b.text || b.content ? (
                      <div className="text-xs text-gray-300">{b.text || b.content}</div>
                    ) : (!b.image && !b.title) ? (
                      <div className="text-xs text-gray-400">Benchmark necompletat.</div>
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
