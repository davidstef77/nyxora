import Link from 'next/link';
import connect from '../api/lib/db';
import Blog from '../api/lib/models/Blog';
import { League_Spartan } from 'next/font/google';

const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: ['400','500','600','700'] });

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Blog Tech - Articole și Recenzii | Nyxora',
  description: 'Citește articolele noastre despre tehnologie, recenzii de produse, ghiduri de cumpărare și sfaturi pentru componente PC, laptopuri și gadget-uri. Află ultimele noutăți din lumea tech.',
  keywords: 'blog tech, articole tehnologie, recenzii produse, ghiduri PC, sfaturi tech, componente PC, laptopuri, gadget-uri, noutăți tech',
  authors: [{ name: 'Echipa Nyxora', url: 'https://www.nyxora.ro' }],
  openGraph: {
    type: 'website',
    siteName: 'Nyxora',
    title: 'Blog Tech - Articole și Recenzii | Nyxora',
    description: 'Descoperă cele mai noi articole despre tehnologie, recenzii detaliate și ghiduri practice pe blogul Nyxora.',
    url: 'https://www.nyxora.ro/blog',
    images: [
      { 
        url: 'https://www.nyxora.ro/og-image.png', 
        width: 1200, 
        height: 630,
        alt: 'Blog Nyxora - Articole Tech și Recenzii',
        type: 'image/png'
      }
    ],
    locale: 'ro_RO'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyxora',
    creator: '@nyxora',
    title: 'Blog Tech - Articole și Recenzii | Nyxora',
    description: 'Articole despre tehnologie, recenzii produse și ghiduri practice pe blogul Nyxora.',
    images: [
      {
        url: 'https://www.nyxora.ro/og-image.png',
        alt: 'Blog Nyxora'
      }
    ]
  },
  alternates: {
    canonical: 'https://www.nyxora.ro/blog'
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1
  }
};

export default async function BlogListPage() {
  try {
    await connect();
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    // Structured data for blog list with enhanced SEO
    const blogListJsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Nyxora Blog",
      "description": "Blog cu articole despre tehnologie, recenzii produse și ghiduri de cumpărare",
      "url": "https://www.nyxora.ro/blog",
      "inLanguage": "ro-RO",
      "publisher": {
        "@type": "Organization",
        "name": "Nyxora",
        "url": "https://www.nyxora.ro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.nyxora.ro/logo.png",
          "width": 250,
          "height": 60
        }
      },
      "blogPost": blogs.map(blog => ({
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt || '',
        "url": `https://www.nyxora.ro/blog/${blog.slug}`,
        "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
        "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
        "author": {
          "@type": "Person",
          "name": blog.author || "Echipa Nyxora",
          "url": "https://www.nyxora.ro"
        },
        "image": blog.image || "https://www.nyxora.ro/og-image.png",
        "publisher": {
          "@type": "Organization",
          "name": "Nyxora",
          "url": "https://www.nyxora.ro"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.nyxora.ro/blog/${blog.slug}`
        }
      }))
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
        />
        <div className={`container px-6 pb-12 pt-28 sm:pt-32 ${leagueSpartan.className}`}>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Blog</h1>
        {blogs.length === 0 ? (
          <p className="text-slate-400">Nu există articole publicate momentan.</p>
        ) : (
          <div className="grid gap-6">
            {blogs.map((b) => (
              <article key={b.slug} className="p-4 rounded-2xl bg-white/5 border border-white/6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1">
                  <Link href={`/blog/${b.slug}`} className="hover:underline">{b.title}</Link>
                </h2>
                <div className="text-sm text-slate-400 mb-2">{b.author ? `${b.author} • ` : ''}{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}</div>
                {b.excerpt && <p className="text-slate-300">{b.excerpt}</p>}
              </article>
            ))}
          </div>
        )}
        </div>
      </>
    );
  } catch (err) {
    console.error('[page]/blog error', err);
    return (
      <div className={`container px-6 pb-12 pt-28 sm:pt-32 ${leagueSpartan.className}`}>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea articolelor.</p>
      </div>
    );
  }
}
