import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { Suspense } from "react";
import logoSrc from '../components/images/N.png';

// Dynamically import components for better code splitting
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("../components/Navbar"), {
  ssr: true,
  loading: () => <div style={{ height: 'var(--navbar-offset)' }} />
});

const Footer = dynamic(() => import("../components/Footer"), {
  ssr: true,
  loading: () => <div style={{ height: '200px' }} />
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Performance: Font display swap
  preload: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false // Only preload primary font
});

export const metadata = {
  title: {
    default: "Nyxora - Configurări PC și componente",
    template: "%s | Nyxora"
  },
  description: "Magazin online pentru componente PC și configurări gaming. Descoperă cele mai bune oferte pentru procesoare, plăci video, memorii RAM și multe altele.",
  keywords: ["componente PC", "configurări gaming", "procesoare", "plăci video", "memorii RAM", "SSD", "gaming", "PC"],
  authors: [{ name: "Nyxora" }],
  creator: "Nyxora",
  publisher: "Nyxora",
  metadataBase: new URL('https://nyxora.ro'),
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://nyxora.ro',
    siteName: 'Nyxora',
    title: 'Nyxora - Configurări PC și componente',
    description: 'Magazin online pentru componente PC și configurări gaming. Descoperă cele mai bune oferte pentru procesoare, plăci video, memorii RAM și multe altele.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nyxora - Componente PC'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nyxora - Configurări PC și componente',
    description: 'Magazin online pentru componente PC și configurări gaming.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  // Note: icons removed to avoid conflict with public/favicon.ico
  // If you need to customize icons, use public/ files or set link tags in head
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        {/* Performance: DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Performance: Resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Explicit favicon links */}
        <link rel="icon" href={logoSrc?.src || '/favicon.ico'} />
        <link rel="shortcut icon" href={logoSrc?.src || '/favicon.ico'} />
        <link rel="apple-touch-icon" href={'/apple-touch-icon.png'} />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Performance: Critical CSS inlined */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: system-ui, -apple-system, sans-serif; }
            .loading-skeleton { background: linear-gradient(90deg, #17181a 25%, #0f1113 50%, #17181a 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          `
        }} />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Nyxora",
              "url": "https://nyxora.ro",
              "logo": "https://nyxora.ro/logo.png",
              "description": "Magazin online pentru componente PC și configurări gaming",
              "sameAs": [
                "https://facebook.com/nyxora",
                "https://instagram.com/nyxora"
              ]
            })
          }}
        />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('[SW] Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('[SW] Service Worker registration failed:', error);
                  });
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            contain: 'layout style' // Performance: Containment
          }}>
            <Suspense fallback={<div className="loading-skeleton" style={{ height: 'var(--navbar-offset)' }} />}>
              <Navbar />
            </Suspense>
            <main style={{ 
              flex: 1,
              width: '100%',
              position: 'relative',
              contain: 'layout' // Performance: Containment for main content
            }}>
              {children}
            </main>
            <Suspense fallback={<div className="loading-skeleton" style={{ height: '200px' }} />}>
              <Footer />
            </Suspense>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
