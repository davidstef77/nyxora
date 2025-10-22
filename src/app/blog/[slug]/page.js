import Image from 'next/image';
import Link from 'next/link';
import connect from '../../api/lib/db';
import Blog from '../../api/lib/models/Blog';
import Product from '../../api/lib/models/Product';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }) {
  try {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return { title: 'Articol negăsit' };
    
    await connect();
    const b = await Blog.findOne({ slug: slugParam, published: true }).lean();
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
    if (!slugParam) {
      return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);
    }
    const b = await Blog.findOne({ slug: slugParam, published: true }).lean();
    if (!b) return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);

    let contentHTML = b.content || '';

    const productSlugs = Array.isArray(b.featuredProducts) ? b.featuredProducts.filter(Boolean) : [];
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <div className="container px-6 py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4">{b.title}</h1>
          <div className="text-sm text-slate-400 mb-6">{b.author} • {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}</div>
        {b.image && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/10 mb-6">
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
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />
        {attachedProducts.length > 0 && (
          <section className="blog-linked-products">
            <h2 className="blog-linked-products__title">Produse menționate</h2>
            <div className="blog-linked-products__list">
              {attachedProducts.map((product) => {
                const price = Array.isArray(product?.affiliateLinks) && product.affiliateLinks.length > 0 ? product.affiliateLinks[0]?.price : product?.displayPrice;
                return (
                  <article key={product.slug} className="blog-linked-product">
                    <div className="blog-linked-product__left">
                      <Link href={`/products/${product.slug}`} className="blog-linked-product__view-btn">Vizualizează produs</Link>
                    </div>
                    <div className="blog-linked-product__main">
                      <h3 className="blog-linked-product__name">{product.name || product.title || product.slug}</h3>
                      {price && <div className="blog-linked-product__price">{price}</div>}
                    </div>
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
    return (<div className="container px-6 py-12"><h1>Eroare</h1></div>);
  }
}
