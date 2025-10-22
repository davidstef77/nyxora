"use client";

import Link from "next/link";
import Image from 'next/image';
import logoSrc from './images/N.png';
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const SITE_TAGLINE = 'PC Components, Laptops, Phones';

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  // Resetăm starea pentru meniul mobil
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null); // Ref pentru meniul mobil
  const inputRef = useRef(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  // Avoid using pathname/session directly during the first render to keep
  // server and client markup identical (prevents hydration mismatches).
  const [mounted, setMounted] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setIsAdminPath(typeof pathname === 'string' && pathname.startsWith('/admin'));
    } catch (err) {
      setIsAdminPath(false);
    }
    // Închide meniul mobil când schimbi pagina
    setShowMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  // Gestionează închiderea meniului mobil și prevenirea scroll-ului
  useEffect(() => {
    // Dacă meniul nu este afișat, nu facem nimic
    if (!showMobileMenu) return;
    
    // Previne scroll-ul când meniul este deschis
    document.body.style.overflow = 'hidden';
    
    // Funcția pentru click în afara meniului
    const handleClickOutside = (e) => {
      // Nu închide dacă click-ul este pe meniul însuși sau pe butonul de toggle
      if (e.target.closest('.mobile-menu-container') || e.target.closest('.mobile-menu-toggle')) {
        return;
      }
      
      // Închide meniul pentru orice alt click
      setShowMobileMenu(false);
    };
    
    // Adaugă event listener cu delay
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200); // Delay mai mare pentru a evita conflicte
    
    // Cleanup la dismount sau când meniul se închide
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [showMobileMenu]);

  function submitSearch(e) {
    e?.preventDefault();
    const q = (searchQ || '').trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setShowSearch(false);
  }

  return (
    <>
      {/* Overlay pentru fundal când meniul mobil este deschis */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 sm:hidden backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}
      
      <header
        className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
        aria-label="Main navigation"
        style={{ 
          opacity: mounted ? 1 : 0, 
          transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.45s ease, transform 0.45s ease'
        }}
      >
        <div className="bg-gradient-to-r from-[var(--purple-700)] to-[var(--purple-600)] border border-white/10">
          <div className="container flex items-center justify-between px-3 sm:px-0 py-2 sm:py-3">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-md overflow-hidden">
                <Image src={logoSrc} alt="Nyxora" width={56} height={56} className="object-cover" />
              </div>
              <div className="hidden xs:flex sm:flex flex-col leading-none min-w-0">
                <span className="font-semibold text-white text-base sm:text-lg truncate">Nyxora</span>
                <span suppressHydrationWarning className="text-xs text-white/80">{SITE_TAGLINE}</span>
              </div>
            </Link>

            {/* Primary nav links (visible on md+) */}
            {/** Render links from a static constant to guarantee identical server/client HTML */}
            <nav className="hidden sm:flex items-center gap-4 ml-6">
              {[
                { href: '/products', label: 'Produse' },
                { href: '/blog', label: 'Blog' },
                { href: '/tops', label: 'Topuri' }
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-white hover:text-white transition-colors" style={{ color: '#fff' }}>{link.label}</Link>
              ))}
            </nav>

            {/* Mobile menu toggle (visible on small screens) */}
            <div className="sm:hidden ml-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Toggle menu cu timeout pentru a evita conflictul cu click outside
                  setTimeout(() => {
                    setShowMobileMenu(prev => !prev);
                  }, 10);
                }} 
                aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                aria-expanded={showMobileMenu}
                className="mobile-menu-toggle inline-flex items-center justify-center p-2 rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors" 
                style={{ color: '#fff' }}
              >
                {showMobileMenu ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Search + icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {showSearch ? (
                <form onSubmit={submitSearch} className="flex items-center gap-1 sm:gap-2 bg-white/15 px-2 sm:px-3 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  <input
                    ref={inputRef}
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Caută..."
                    aria-label="Caută în produse"
                    className="bg-transparent text-white placeholder-white/70 outline-none px-1 sm:px-2 text-sm sm:text-base w-32 sm:w-auto"
                  />
                  <button type="submit" className="text-white p-1 hover:bg-white/10 rounded-full transition-colors" aria-label="Caută">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"/>
                    </svg>
                  </button>
                  <button type="button" onClick={() => { setShowSearch(false); setSearchQ(''); }} className="text-white/80 p-1 hover:bg-white/10 rounded-full transition-colors text-sm" aria-label="Close search">✕</button>
                </form>
              ) : (
                <button onClick={() => setShowSearch(true)} className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Deschide căutare" style={{ color: '#fff' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path stroke="currentColor" strokeWidth="1.8" d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"/>
                  </svg>
                </button>
              )}

              <Link href="/favorites" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Favorite" style={{ color: '#fff' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 21s-6.716-4.686-9.3-7.028C-0.302 11.357 1.08 6.5 5.4 5.07 7.74 4.21 9.59 5.03 12 7.01c2.41-1.98 4.26-2.8 6.6-1.94 4.32 1.43 5.7 6.29 2.7 8.902C18.716 16.314 12 21 12 21z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
                </svg>
              </Link>

              {/* Auth / Admin behavior - render a deterministic fallback on SSR
                  to avoid hydration mismatches. After mount we can show the
                  actual session-dependent UI. */}
              {mounted ? (
                isAdminPath ? (
                  status === 'authenticated' && session ? (
                    <Link href="/admin" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Admin" style={{ color: '#fff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" fill="currentColor" />
                      </svg>
                    </Link>
                  ) : (
                    <Link href="/admin/login" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Admin login" style={{ color: '#fff' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  )
                ) : (
                  status === 'authenticated' && session ? (
                    <Link href="/profile" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Profil" style={{ color: '#fff' }}>
                      {session.user?.image ? (
                        <img src={session.user.image} alt={session.user?.name || 'Avatar'} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" fill="currentColor" />
                        </svg>
                      )}
                    </Link>
                  ) : (
                    <Link href="/auth/signin" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Sign in" style={{ color: '#fff' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  )
                )
              ) : (
                // Fallback shown during SSR / before hydration completes.
                // Keep the markup identical to the unauthenticated state so the
                // server-rendered HTML matches the client's initial render.
                <Link href="/auth/signin" className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors active:scale-95" aria-label="Sign in" style={{ color: '#fff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div 
            className="mobile-menu-container fixed left-2 right-2 top-[4.5rem] z-40 sm:hidden bg-gradient-to-br from-[rgba(17,24,39,0.95)] to-[rgba(15,23,42,0.95)] rounded-2xl shadow-2xl p-4 backdrop-blur-lg border border-white/10"
            style={{
              animation: 'slideDown 0.2s ease-out',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()} // Previne propagarea care ar putea închide meniul
          >
            <nav className="flex flex-col gap-2">
              {[
                { href: '/products', label: 'Produse' }, 
                { href: '/blog', label: 'Blog' }, 
                { href: '/tops', label: 'Topuri' }
              ].map(l => (
                <Link 
                  key={l.href} 
                  href={l.href} 
                  onClick={() => setShowMobileMenu(false)}
                  className="text-white px-4 py-3 rounded-xl hover:bg-white/10 transition-colors font-medium active:scale-95 transform" 
                  style={{ color: '#fff' }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}