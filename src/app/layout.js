import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../components/Footer.css";
import logoSrc from '../components/images/N.png';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  icons: {
    icon: logoSrc?.src,
    shortcut: logoSrc?.src || '/favicon.ico',
    apple: logoSrc?.src || '/favicon.ico'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        {/* explicit favicon links so the icon shows in page meta/head */}
        <link rel="icon" href={logoSrc?.src || '/favicon.ico'} />
        <link rel="shortcut icon" href={logoSrc?.src || '/favicon.ico'} />
        <link rel="apple-touch-icon" href={'/apple-touch-icon.png'} />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: 'var(--navbar-offset)' }}>
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
