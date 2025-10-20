import Image from '../../../components/SmartImage';
import Link from 'next/link';
import connect from '../../api/lib/db';
import Product from '../../api/lib/models/Product';
import ProductGallery from '../../../components/ProductGallery';
import OffersList from '../../../components/OffersList';
import ProductTabs from '../../../components/ProductTabs';
import FavoriteButton from '../../../components/FavoriteButton';
import ScrollToTop from '../../../components/ScrollToTop';

export async function generateMetadata({ params }) {
  try {
    const p = await params; // ensure dynamic params are resolved
    await connect();
    const prod = await Product.findOne({ slug: p.slug }).lean();
    
    if (!prod) {
      return { 
        title: 'Produs Negăsit - Nyxora',
        description: 'Produsul căutat nu a fost găsit pe Nyxora.',
        robots: 'noindex,nofollow'
      };
    }

    const title = `${prod.name} - Recenzii și Oferte | Nyxora`;
    const description = prod.description 
      ? `${prod.description.slice(0, 140)}... Găsește cele mai bune oferte pentru ${prod.name} pe Nyxora.`
      : `Descoperă ${prod.name} pe Nyxora. Compară prețuri și găsește cele mai bune oferte.`;
    
    const canonical = `https://nyxora.ro/products/${prod.slug}`;
    const ogImages = prod.image ? [{ url: prod.image, width: 1200, height: 630 }] : [{ url: 'https://nyxora.ro/og-image.png', width: 1200, height: 630 }];

    return {
      title,
      description,
      keywords: `${prod.name}, review, recenzie, preț, oferte, comparație, Nyxora`,
      authors: [{ name: 'Nyxora' }],
      canonical,
      alternates: {
        canonical
      },
      openGraph: {
        type: 'website',
        siteName: 'Nyxora',
        title,
        description,
        url: canonical,
        images: ogImages,
        locale: 'ro_RO'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@nyxora',
        creator: '@nyxora',
        title,
        description,
        images: ogImages
      },
      robots: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
    };
  } catch (err) {
    console.error('Product metadata generation error:', err);
    return { 
      title: 'Produs - Nyxora',
      description: 'Explorează produsele pe Nyxora.',
      robots: 'noindex'
    };
  }
}


async function getProductBySlug(slug) {
  try {
    await connect();
    // Simple product fetch without manufacturer join — manufacturers are no longer displayed
    const res = await Product.aggregate([
      { $match: { slug } },
      { $limit: 1 },
      { $project: { name:1, slug:1, images:1, image:1, description:1, affiliateLinks:1, benchmarks:1, metadata:1, _id:1 } }
    ]).allowDiskUse(true);
    return res && res.length > 0 ? res[0] : null;
  } catch (err) {
    console.error('[product page] getProductBySlug error', err);
    return null;
  }
}

export default async function ProductPage({ params }) {
  try {
    const p = await params; // resolve dynamic params
    const product = await getProductBySlug(p.slug);

    if (!product) {
      return (
  <div className="container p-8">
          <h1 className="text-2xl font-semibold">Produs negăsit</h1>
          <Link href="/" className="text-cyan-400 mt-4 block">Înapoi la listă</Link>
        </div>
      );
    }

    // Offers will be sourced from product-level affiliate links only (manufacturers hidden)
    const offersList = [];

    // also expose any affiliateLinks attached directly on the product (legacy/extra links)
  const affiliateLinks = Array.isArray(product.affiliateLinks) ? product.affiliateLinks.map(a => ({ storeName: a.storeName, url: a.url, price: a.price })) : [];

    // Build primaryOffer for JSON-LD (lowest price if available)
    let primaryOffer = undefined;
    if (offersList.length > 0) {
      const chosen = offersList.reduce((a, b) => (a.priceValue < b.priceValue ? a : b));
      primaryOffer = { '@type': 'Offer', price: String(chosen.priceValue), priceCurrency: chosen.priceCurrency };
    } else if (affiliateLinks.length > 0) {
      const parsed = affiliateLinks[0].price ? String(affiliateLinks[0].price).match(/([0-9]+[\.,]?[0-9]*)/) : null;
      if (parsed) primaryOffer = { '@type': 'Offer', price: parsed[1].replace(',', '.'), priceCurrency: 'RON' };
    }

    // Enhanced structured data for product
    const productJsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `Descoperă ${product.name} pe Nyxora`,
      "sku": product.slug,
      "mpn": product.slug,
      "brand": {
        "@type": "Brand",
        "name": "Nyxora"
      },
      "image": product.image ? [product.image] : ["https://nyxora.ro/placeholder-product.svg"],
      "url": `https://nyxora.ro/products/${product.slug}`,
      "offers": primaryOffer ? {
        "@type": "Offer",
        "price": primaryOffer.price,
        "priceCurrency": primaryOffer.priceCurrency || "RON",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Nyxora"
        }
      } : {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Nyxora"
        }
      },
      "aggregateRating": offersList.length > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "1"
      } : undefined
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-800">
          <div className="container p-8" id="product-main">
            <ScrollToTop targetId="product-main" behavior="smooth" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/70 to-slate-800/50 shadow-xl p-4">
              <ProductGallery images={(product.images && product.images.length>0) ? product.images : (product.image ? [product.image] : [])} alt={product.name} />
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="text-sm text-slate-400 mb-4">SKU: <span className="font-mono">{product.slug}</span></div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-white">{primaryOffer ? `${primaryOffer.price} ${primaryOffer.priceCurrency || 'RON'}` : 'Preț nedefinit'}</div>
                <div className="text-sm text-slate-400">Livrare și taxe pot varia</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Descriere</h3>
                <p className="text-slate-300 leading-relaxed">{product.description || 'Nu există descriere disponibilă pentru acest produs.'}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Oferte & link-uri</h3>
                <OffersList offers={offersList} affiliateLinks={affiliateLinks} />
              </div>
            </div>

              <div className="mt-6 flex gap-3 items-center">
              <a href="#offers" style={{ color: '#fff' }} className="px-6 py-3 rounded-2xl text-lg shadow-lg bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 text-white">Vezi ofertele</a>
              <Link href="/" style={{ color: '#fff' }} className="px-4 py-2 rounded border border-slate-700 text-white">Înapoi la listă</Link>
              <div className="ml-2">
                <FavoriteButton productSlug={product.slug} size={44} />
              </div>
            </div>

            {/* Mobile sticky CTA */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] sm:hidden">
              <a href="#offers" style={{ color: '#fff' }} className="w-full block text-center bg-indigo-600 text-white py-3 rounded-2xl font-semibold shadow-xl">Vezi ofertele</a>
            </div>

            <div className="mt-10">
                <ProductTabs description={product.description} specs={product.metadata?.specs || {}} benchmarks={product.benchmarks || product.metadata?.benchmarks || []} />
            </div>
          </div>
        </div>
        </div>
        </main>
      </>
    );
  } catch (err) {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-semibold">Eroare la încărcare</h1>
        <p className="text-slate-300">{String(err)}</p>
      </div>
    );
  }
}
