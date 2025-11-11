"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from './SmartImage'

export default function ProductGallery({ images = [], alt }) {
  // Sanitize incoming images: keep only non-empty strings
  const imgs = useMemo(() => {
    const arr = Array.isArray(images) ? images.filter(i => typeof i === 'string' && i.trim()) : [];
    return arr.length ? arr : ['/placeholder-product.svg'];
  }, [images]);

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Ensure index stays in bounds when images array changes
  useEffect(() => {
    if (index >= imgs.length) setIndex(0);
  }, [imgs, index]);

  const prev = (e) => { e?.stopPropagation(); setIndex((i) => (i - 1 + imgs.length) % imgs.length) }
  const next = (e) => { e?.stopPropagation(); setIndex((i) => (i + 1) % imgs.length) }

  return (
    <div>
      {/* Main image with modern hover effect */}
      <div
        className="group relative w-full h-80 sm:h-[28rem] lg:h-[34rem] rounded-xl overflow-hidden cursor-zoom-in bg-neutral-950 border border-gray-800"
        onClick={() => setLightbox(true)}
        aria-label="Deschide imaginea în vizualizare mare"
        role="button"
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <Image 
            src={imgs[index]} 
            alt={alt || 'Product image'} 
            fill 
            sizes="(min-width: 1280px) 900px, (min-width: 768px) 80vw, 100vw" 
            style={{ objectFit: 'contain' }} 
          />
        </div>
        {/* Decorative subtle glow on hover */}
        <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-20 blur-3xl transition duration-500 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.4),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-800/60 group-hover:ring-purple-500/40" />
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border ${i===index? 'border-white' : 'border-gray-700 hover:border-gray-500'} transition`}
              aria-label={`Imagine ${i+1}`}
            >
              <div className="w-full h-full relative">
                <Image 
                  src={src} 
                  alt={`${alt || 'thumb'} ${i+1}`} 
                  fill 
                  sizes="64px" 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-[92vw] h-[80vh] max-w-6xl">
            <Image 
              src={imgs[index]} 
              alt={alt || 'Product image large'} 
              fill 
              sizes="(min-width: 1280px) 1100px, 100vw" 
              style={{ objectFit: 'contain' }} 
              priority 
            />

            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
                >
                  →
                </button>
              </>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs"
              aria-label="Închide"
            >
              Închide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
