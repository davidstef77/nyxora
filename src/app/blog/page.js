import Link from 'next/link';
import connect from '../api/lib/db';
import Blog from '../api/lib/models/Blog';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Blog - Articole Tech și Recenzii | Nyxora',
  description: 'Citește articolele noastre despre tehnologie, recenzii de produse, ghiduri și sfaturi pentru componente PC, laptopuri și gadget-uri.',
  keywords: 'blog tech, articole tehnologie, recenzii produse, ghiduri PC, sfaturi tech, componente',
  authors: [{ name: 'Nyxora' }],
  openGraph: {
    type: 'website',
    siteName: 'Nyxora',
    title: 'Blog Tech - Articole și Recenzii | Nyxora',
    description: 'Descoperă cele mai noi articole despre tehnologie, recenzii și ghiduri pe blogul Nyxora.',
    url: 'https://nyxora.ro/blog',
    images: [{ url: 'https://nyxora.ro/og-image.png', width: 1200, height: 630 }],
    locale: 'ro_RO'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyxora',
    title: 'Blog Tech - Nyxora',
    description: 'Articole despre tehnologie, recenzii și ghiduri pe blogul Nyxora.',
    images: ['https://nyxora.ro/og-image.png']
  },
  alternates: {
    canonical: 'https://nyxora.ro/blog'
  },
  robots: 'index,follow,max-snippet:-1,max-image-preview:large'
};

export default async function BlogListPage() {
  try {
    await connect();
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    // Structured data for blog list
    const blogListJsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Nyxora Blog",
      "description": "Blog cu articole despre tehnologie, recenzii produse și ghiduri",
      "url": "https://nyxora.ro/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Nyxora",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nyxora.ro/logo.png"
        }
      },
      "blogPost": blogs.map(blog => ({
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt || '',
        "url": `https://nyxora.ro/blog/${blog.slug}`,
        "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
        "author": {
          "@type": "Person",
          "name": blog.author || "Nyxora"
        }
      }))
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
        />
        <div className="container px-6 py-12">
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
      <div className="container px-6 py-12">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea articolelor.</p>
      </div>
    );
  }
}
