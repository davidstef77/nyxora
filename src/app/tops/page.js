import Link from 'next/link';
import connect from '../api/lib/db';
import Top from '../api/lib/models/Top';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Top Produse - Recomandări Expert | Nyxora',
  description: 'Descoperă topurile noastre cu cele mai bune produse tech: laptopuri, telefoane, componente PC, periferice și multe altele. Recomandări bazate pe teste și analize detaliate.',
  keywords: 'top produse, recomandări produse, cele mai bune laptopuri, top telefoane, componente PC, top gaming, produse tech, comparație produse',
  authors: [{ name: 'Echipa Nyxora', url: 'https://nyxora.ro' }],
  alternates: {
    canonical: 'https://nyxora.ro/tops'
  },
  openGraph: {
    title: 'Top Produse - Recomandări Expert | Nyxora',
    description: 'Descoperă topurile noastre cu cele mai bune produse tech selectate și testate de experții Nyxora.',
    url: 'https://nyxora.ro/tops',
    type: 'website',
    images: [
      {
        url: 'https://nyxora.ro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Top Produse Nyxora',
        type: 'image/png'
      }
    ],
    locale: 'ro_RO',
    siteName: 'Nyxora'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyxora',
    creator: '@nyxora',
    title: 'Top Produse - Recomandări Expert | Nyxora',
    description: 'Cele mai bune produse tech selectate și testate de experții Nyxora.',
    images: [
      {
        url: 'https://nyxora.ro/og-image.png',
        alt: 'Top Produse Nyxora'
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large'
    }
  }
};

export default async function TopsListPage() {
  try {
    await connect();
    const tops = await Top.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    // Structured data for tops list
    const topsListJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Top Produse Nyxora",
      "description": "Colecție de topuri cu cele mai bune produse tech",
      "url": "https://nyxora.ro/tops",
      "inLanguage": "ro-RO",
      "publisher": {
        "@type": "Organization",
        "name": "Nyxora",
        "url": "https://nyxora.ro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nyxora.ro/logo.png",
          "width": 250,
          "height": 60
        }
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": tops.map((top, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://nyxora.ro/tops/${top.slug}`,
          "name": top.title,
          "description": top.description
        }))
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(topsListJsonLd) }}
        />
        <div className="container px-6 py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Topuri</h1>
          {tops.length === 0 ? (
            <p className="text-slate-400">Nu există topuri publicate momentan.</p>
          ) : (
            <div className="grid gap-6">
              {tops.map((t) => (
                <article key={t.slug} className="p-4 rounded-2xl bg-white/5 border border-white/6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    <Link href={`/tops/${t.slug}`} className="hover:underline">{t.title}</Link>
                  </h2>
                  {t.description && <p className="text-slate-300">{t.description}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </>
    );
  } catch (err) {
    console.error('[page]/tops error', err);
    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl font-semibold">Topuri</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea topurilor.</p>
      </div>
    );
  }
}
