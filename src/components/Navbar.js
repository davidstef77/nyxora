"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  function submitSearch(e) {
    e?.preventDefault();
    const q = (searchQ || '').trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setShowSearch(false);
  }

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="fixed top-4 left-4 right-4 z-50 rounded-xl shadow-2xl overflow-hidden"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--purple-700)] to-[var(--purple-600)]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              N
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-semibold text-white text-lg">Nyxora</span>
              <span className="text-xs text-white/80">PC components</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/products" className="text-white" style={{ color: 'white' }}>Produse</Link>
            <Link href="/categories" className="text-white" style={{ color: 'white' }}>Categorii</Link>
            <Link href="/build" className="text-white" style={{ color: 'white' }}>Planificator</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop: show a search icon or inline search input */}
            <div className="hidden md:flex items-center">
              {showSearch ? (
                <form onSubmit={submitSearch} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full">
                  <input
                    ref={inputRef}
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Caută componente..."
                    aria-label="Caută în produse"
                    className="bg-transparent text-white placeholder-white/60 outline-none px-2"
                  />
                  <button type="submit" className="text-white p-1" aria-label="Caută">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path stroke="currentColor" strokeWidth="1.6" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"/>
                    </svg>
                  </button>
                  <button type="button" onClick={() => { setShowSearch(false); setSearchQ(''); }} className="text-white/80 p-1" aria-label="Close search">✕</button>
                </form>
              ) : (
                <button onClick={() => setShowSearch(true)} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white" aria-label="Deschide căutare">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.6" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"/>
                  </svg>
                </button>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-md text-white"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path stroke="currentColor" strokeWidth="1.6" d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-start justify-center pt-24"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />

            <motion.aside
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-[94%] max-w-sm rounded-xl bg-gradient-to-br from-[var(--purple-700)] to-[var(--purple-600)] text-white p-6 mx-auto shadow-2xl"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">NX</div>
                  <div>
                    <div className="font-semibold text-white">Nyxora</div>
                    <div className="text-xs text-white/80">PC components</div>
                  </div>
                </div>
                <button className="p-2 text-white/80" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
              </div>

              <nav className="flex flex-col gap-3">
                <Link href="/products" className="py-3 px-3 rounded-md text-white hover:bg-white/10" style={{ color: 'white' }}>Produse</Link>
                <Link href="/categories" className="py-3 px-3 rounded-md text-white hover:bg-white/10" style={{ color: 'white' }}>Categorii</Link>
                <Link href="/build" className="py-3 px-3 rounded-md text-white hover:bg-white/10" style={{ color: 'white' }}>Planificator</Link>
              </nav>

              <div className="mt-6">
                <Link href="/products" className="w-full inline-flex justify-center bg-white/10 text-white py-3 rounded-full">Vezi Produse</Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}