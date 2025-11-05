import Image from 'next/image';
import Link from 'next/link';
import connect from '../../api/lib/db';
import Blog from '../../api/lib/models/Blog';
import Product from '../../api/lib/models/Product';
import { League_Spartan } from 'next/font/google';
import { sanitizeSlug, sanitizeArray, sanitizeJsonLd } from '../../../lib/sanitize';

const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: ['400','500','600','700'] });

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }) {
  try {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    
    // Sanitize slug to prevent NoSQL injection
    const sanitizedSlug = sanitizeSlug(slugParam);
    if (!sanitizedSlug) return { title: 'Articol negăsit' };
    
    await connect();
    const b = await Blog.findOne({ slug: sanitizedSlug, published: true }).lean();
    if (!b) return { title: 'Articol negăsit' };

    const title = b.title;
    const description = b.excerpt || (b.content ? b.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : '');
    const url = `https://nyxora.ro/blog/${b.slug}`;
    const image = b.image || 'https://nyxora.ro/og-image.png';
    const publishedTime = b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined;
    const modifiedTime = b.updatedAt ? new Date(b.updatedAt).toISOString() : publishedTime;

    return {
      title,
      description,
      keywords: b.tags?.join(', '),
      authors: [{ name: b.author || 'Nyxora' }],
      openGraph: {
        title,
        description,
        url,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title
          }
        ],
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: [b.author || 'Nyxora'],
        tags: b.tags,
        locale: 'ro_RO',
        siteName: 'Nyxora'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image]
      },
      alternates: {
        canonical: url
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (err) {
    console.error('Error generating blog metadata:', err);
    return { title: 'Articol' };
  }
}

export default async function BlogDetail({ params }) {
  try {
    await connect();
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    
    // Sanitize slug to prevent NoSQL injection
    const sanitizedSlug = sanitizeSlug(slugParam);
    if (!sanitizedSlug) {
      return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);
    }
    const b = await Blog.findOne({ slug: sanitizedSlug, published: true }).lean();
    if (!b) return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);

    let contentHTML = b.content || '';

    // Sanitize featured products slugs to prevent NoSQL injection
    const productSlugsRaw = Array.isArray(b.featuredProducts) ? b.featuredProducts.filter(Boolean) : [];
    const productSlugs = sanitizeArray(productSlugsRaw);
    let attachedProducts = [];

    if (productSlugs.length) {
      const docs = await Product.find({ slug: { $in: productSlugs } }).lean();
      const map = new Map(docs.map((prod) => [prod.slug, prod]));
      attachedProducts = productSlugs.map((slug) => map.get(slug)).filter(Boolean);
    }

    if (!contentHTML) {
      contentHTML = b.excerpt || '';
    }

    // Structured data for article
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": b.title,
      "description": b.excerpt || '',
      "image": b.image ? [b.image] : ["https://nyxora.ro/og-image.png"],
      "author": {
        "@type": "Person",
        "name": b.author || "Nyxora"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nyxora",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nyxora.ro/logo.png"
        }
      },
      "datePublished": b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined,
      "dateModified": b.updatedAt ? new Date(b.updatedAt).toISOString() : (b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined),
      "url": `https://nyxora.ro/blog/${b.slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://nyxora.ro/blog/${b.slug}`
      },
      "keywords": Array.isArray(b.tags) ? b.tags.join(', ') : ''
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sanitizeJsonLd(articleJsonLd)) }}
        />
        <div className={`container px-4 sm:px-6 max-w-3xl mx-auto pb-16 pt-28 sm:pt-32 ${leagueSpartan.className}`}
          style={{ background: 'linear-gradient(to bottom, #181818 0%, #232323 100%)', borderRadius: '1.5rem' }}>
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-2xl">📝</span>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Articol Blog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white leading-tight">{b.title}</h1>
            <div className="text-sm text-slate-400 mb-2">{b.author} • {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}</div>
          </div>
          {/* Featured Image */}
          {b.image && (
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 mb-8 shadow-lg">
              <Image
                src={b.image}
                alt={b.title}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {/* Blog Content */}
          <div className="prose prose-invert prose-xl max-w-none mb-12" dangerouslySetInnerHTML={{ __html: contentHTML }} />
          {/* Mentioned Products */}
          {attachedProducts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center text-white">🛒 Produse menționate</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {attachedProducts.map((product) => {
                  const price = Array.isArray(product?.affiliateLinks) && product.affiliateLinks.length > 0 ? product.affiliateLinks[0]?.price : product?.displayPrice;
                  const img = (product.images && product.images.length) ? product.images[0] : (product.image || null);
                  return (
                    <article key={product.slug} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-md p-5 flex flex-col items-center text-center">
                      {img && (
                        <div className="mb-4 w-full flex justify-center">
                          <Image src={img} alt={product.name} width={120} height={120} className="rounded-lg object-contain" unoptimized />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mb-2 text-white">{product.name || product.title || product.slug}</h3>
                      {price && <div className="text-xl font-bold text-yellow-500 mb-2">{price} RON</div>}
                      <Link href={`/products/${product.slug}`} className="inline-block px-5 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-all mt-2">Vizualizează produs</Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </>
    );
  } catch (err) {
    console.error('[page]/blog/[slug] error', err);
    return (<div className={`container px-6 pb-12 pt-28 sm:pt-32 ${leagueSpartan.className}`}><h1>Eroare</h1></div>);
  }
}
