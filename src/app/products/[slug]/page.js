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
    if (!prod) return { title: 'Produs - Nyxora' };
    // If product has manufacturerRef, fetch manufacturer to expose prices in metadata if needed
    let ogImages = prod.image ? [prod.image] : undefined;
    return {
      title: `${prod.name} — Nyxora`,
      description: prod.description ? prod.description.slice(0, 160) : 'Produs din Nyxora',
      openGraph: {
        title: prod.name,
        description: prod.description ? prod.description.slice(0, 160) : 'Produs Nyxora',
        images: ogImages,
      }
    };
  } catch (err) {
    return { title: 'Produs - Nyxora' };
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

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-800">
        <div className="container p-8" id="product-main">
          <ScrollToTop targetId="product-main" behavior="smooth" />
        {/* JSON-LD for Product */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.image ? [product.image] : undefined,
          description: product.description,
          sku: product.slug,
          offers: primaryOffer
        }) }} />

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
