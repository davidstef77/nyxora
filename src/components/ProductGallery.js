"use client"

import { useState } from 'react'
import Image from './SmartImage'

export default function ProductGallery({ images = [], alt }) {
  const imgs = images && images.length > 0 ? images : ['']
  const [index, setIndex] = useState(0)

  return (
    <div>
      <div className="w-full h-96 bg-gradient-to-br from-slate-900/80 to-slate-800 rounded-2xl overflow-hidden relative shadow-xl ring-1 ring-white/5">
        <Image src={imgs[index]} alt={alt || 'Product image'} fill style={{ objectFit: 'cover' }} />
        {/* subtle colorful overlay bottom-left */}
        <div className="absolute left-4 bottom-4 bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">{alt}</div>
      </div>

      {imgs.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {imgs.map((src, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-20 h-14 rounded-lg overflow-hidden transform transition ${i===index? 'ring-2 ring-cyan-400 scale-105 shadow-lg':'hover:scale-105'} bg-gradient-to-tr from-slate-800/40 to-slate-700/20`}>
              <div className="w-full h-full relative">
                <Image src={src} alt={`${alt || 'thumb'} ${i+1}`} fill style={{ objectFit: 'cover' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
