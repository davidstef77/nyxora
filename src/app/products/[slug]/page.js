import Image from '../../../components/SmartImage';
import Link from 'next/link';
import connect from '../../api/lib/db';
import Product from '../../api/lib/models/Product';
import ProductGallery from '../../../components/ProductGallery';
import OffersList from '../../../components/OffersList';
import ProductTabs from '../../../components/ProductTabs';
import FavoriteButton from '../../../components/FavoriteButton';
import ScrollToTop from '../../../components/ScrollToTop';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

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
          <Link href="/" className="text-white hover:text-slate-200 mt-4 block">Înapoi la listă</Link>
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
        <main className="min-h-screen bg-black">
          <div className="max-w-4xl mx-auto p-3" id="product-main">
            <ScrollToTop targetId="product-main" behavior="smooth" />

        {/* Image Section - Full Width */}
        <div className="mb-4">
          <ProductGallery images={(product.images && product.images.length>0) ? product.images : (product.image ? [product.image] : [])} alt={product.name} />
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          {/* Title and Price */}
          <div>
            <h1 className="text-xs font-normal text-white mb-1 leading-snug">{product.name}</h1>
            <div className="text-lg font-medium text-white">
              {primaryOffer ? `${primaryOffer.price} ${primaryOffer.priceCurrency || 'RON'}` : 'Preț nedefinit'}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-300">{product.description || 'Nu există descriere disponibilă pentru acest produs.'}</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <a href="#offers" className="inline-flex items-center rounded-md bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 transition">Vezi oferte</a>
            <Link href="/" className="inline-flex items-center rounded-md bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 transition">Înapoi</Link>
            <div className="ml-1">
              <FavoriteButton productSlug={product.slug} size={20} />
            </div>
          </div>

          {/* Offers */}
          <div>
            <OffersList offers={offersList} affiliateLinks={affiliateLinks} />
          </div>

          {/* Product Details Tabs */}
          <div>
            <ProductTabs description={product.description} specs={product.metadata?.specs || {}} benchmarks={product.benchmarks || product.metadata?.benchmarks || []} />
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
