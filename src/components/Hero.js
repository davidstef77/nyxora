"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import './Hero.css'

export default function Hero({
  title = 'Găsește laptopuri, telefoane și componente — topuri, recenzii și oferte',
  subtitle = 'Recenzii aprofundate, topuri, benchmark-uri și linkuri afiliate pentru laptopuri, telefoane și componente PC. Alege inteligent și găsește cea mai bună ofertă.',
  primaryCta = { label: 'Vezi Produse', href: '/products' },
  secondaryCta = { label: 'Planificator Build', href: '/build' },
}) {
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-gradient-overlay"></div>
      </div>
      <div className="hero-container">
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="hero-search-and-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <form role="search" onSubmit={handleSearch} className="hero-search-form">
              <input
                id="hero-search"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Caută laptop, telefon, CPU, GPU, SSD..."
                aria-label="Caută laptop, telefon sau componente"
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-button" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>

            <div className="hero-cta-buttons">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={primaryCta.href} className="btn-primary">
                  {primaryCta.label}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={secondaryCta.href} className="btn-secondary">
                  {secondaryCta.label}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
