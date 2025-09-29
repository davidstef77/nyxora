"use client"

import Image from './SmartImage'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Hero({
  title = 'Construiește PC-ul Viitorului',
  subtitle = 'Componente premium, oferte actualizate și ghiduri pas cu pas.',
  primaryCta = { label: 'Vezi Produse', href: '/products' },
  secondaryCta = { label: 'Planificator Build', href: '/build' },
  imageSrc = 'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg',
  imageAlt = 'Configurare PC high-end cu GPU și procesor',
  showSearch = true,
  mobileMode = 'headline-with-cta' // 'headline-only' or 'headline-with-cta'
}) {
  const [q, setQ] = useState('')
  const [reduceMotion, setReduceMotion] = useState(false)
  const router = useRouter()

  // Respect user prefers-reduced-motion (run on mount, not during render)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handle = (e) => setReduceMotion(e.matches)
    // set initial
    setReduceMotion(mq.matches)
    // add listener (modern and fallback)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handle)
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(handle)
    }
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handle)
      } else if (typeof mq.removeListener === 'function') {
        mq.removeListener(handle)
      }
    }
  }, [])

  return (
    <section
      className="relative overflow-hidden pt-20 pb-12"
      style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--panel) 100%)' }}
      aria-label="Hero - Construiește PC-ul Viitorului"
    >
      <div className="container mx-auto px-6 py-8 lg:py-20">

        {/* Mobile-first hero: compact and tappable */}
        <div className="sm:hidden text-center">
          <motion.h1
            className={`px-2 py-2 text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent gradient-text-fallback ${!reduceMotion ? 'heading-shimmer' : ''}`}
            style={{ background: 'linear-gradient(90deg, var(--purple-600), var(--accent))', color: 'var(--text)' }}
            {...(!reduceMotion ? { initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.5 } } : {})}
          >
            {title}
          </motion.h1>

          {/* Optional mobile subtitle (small, muted) */}
          {mobileMode !== 'headline-only' && (
            <p className="mt-3 text-sm text-[var(--muted-text)] px-6">{subtitle}</p>
          )}

          {/* Primary tappable CTA for mobile */}
          <div className="mt-6">
            <Link href={primaryCta.href} aria-label={primaryCta.label} className="inline-block w-44 mx-auto">
              <span className="inline-flex items-center justify-center w-full py-3 rounded-full"
                style={{ background: 'linear-gradient(90deg,var(--purple-600),var(--accent))', color: '#fff', boxShadow: '0 8px 30px rgba(124,58,237,0.16)' }}>
                {primaryCta.label}
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop / larger screens: richer layout */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 text-left">
            <motion.h1
              className={`pl-2 pt-2 pb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent gradient-text-fallback ${!reduceMotion ? 'heading-shimmer' : ''}`}
              style={{ background: 'linear-gradient(90deg, var(--purple-600), var(--accent))', color: 'var(--text)' }}
              {...(!reduceMotion ? { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.2 } } : {})}
            >
              {title}
            </motion.h1>

            <motion.p className="mt-4 text-lg max-w-2xl" style={{ color: 'var(--muted-text)' }} {...(!reduceMotion ? { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.4 } } : {})}>
              {subtitle}
            </motion.p>

            <motion.div className="mt-8 max-w-xl panel p-6" {...(!reduceMotion ? { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.6 } } : {})}>
              {showSearch && (
                <form role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${encodeURIComponent(q)}`) }} className="flex gap-3 items-center">
                  <label htmlFor="hero-search" className="sr-only">Caută componente</label>
                  <input
                    id="hero-search"
                    name="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Caută procesor, placă video, SSD..."
                    aria-label="Caută procesoare, plăci video, SSD..."
                    className="flex-1 bg-transparent border rounded-md px-4 py-2 focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: 'rgba(124,58,237,0.2)', color: 'var(--text)', backgroundColor: 'rgba(124,58,237,0.05)' }}
                  />
                </form>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href={primaryCta.href} className="btn-primary inline-block" aria-label={primaryCta.label}>{primaryCta.label}</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link href={secondaryCta.href} className="inline-block px-4 py-2 rounded-full border transition-all" style={{ borderColor: 'rgba(124,58,237,0.3)', color: 'var(--text)' }}>{secondaryCta.label}</Link>
                </motion.div>
                <Link href="/categories" className="text-sm hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--muted-text)' }}>Vezi Categorii</Link>
              </div>
            </motion.div>
          </div>

         
        </div>

      </div>
    </section>
  )
}
