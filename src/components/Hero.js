"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
          <h1 className="hero-title fade-in">
            {title}
          </h1>

          <p className="hero-subtitle fade-in" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>

          <div className="hero-search-and-cta fade-in" style={{ animationDelay: '0.4s' }}>
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
              <div>
                <Link href={primaryCta.href} className="btn-primary">
                  {primaryCta.label}
                </Link>
              </div>
              <div>
                <Link href={secondaryCta.href} className="btn-secondary">
                  {secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
