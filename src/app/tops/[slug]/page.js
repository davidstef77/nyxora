import connect from '../../api/lib/db';
import Top from '../../api/lib/models/Top';
import Product from '../../api/lib/models/Product';
import SmartImage from '../../../components/SmartImage';
import { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';

const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: ['400','500','600','700'] });

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }) {
  try {
    await connect();
    const { slug } = params;
    const top = await Top.findOne({ slug, published: true }).lean();
    
    if (!top) {
      return {
        title: 'Top negăsit',
        description: 'Topul solicitat nu a fost găsit.'
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyxora.ro';
    const canonical = `${baseUrl}/tops/${top.slug}`;

    return {
      title: `${top.title} | Nyxora`,
      description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experții noștri`,
      alternates: {
        canonical
      },
      openGraph: {
        title: top.title,
        description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experții noștri`,
        type: 'article',
        url: canonical
      },
      twitter: {
        card: 'summary_large_image',
        title: top.title,
        description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experților noștri`
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true
        }
      }
    };
  } catch (err) {
    console.error('Error generating metadata for top:', err);
    return {
      title: 'Top | PC Affiliate',
      description: 'Top produse recomandate'
    };
  }
}

export default async function TopDetail({ params }) {
  try {
    await connect();
    const { slug } = params;
    const top = await Top.findOne({ slug, published: true }).lean();
    if (!top) {
      return (
        <div className={`container px-6 pb-12 pt-32 sm:pt-36 text-center ${leagueSpartan.className}`}>
          <h1 className="text-2xl font-semibold mb-4">Top negăsit</h1>
          <p className="text-slate-400">Topul solicitat nu există sau nu este publicat.</p>
        </div>
      );
    }

    // Sanitize items array and support legacy productRef (ObjectId) as well as new productSlug
    const itemsRaw = Array.isArray(top.items) ? top.items.filter(Boolean) : [];
    const productSlugs = itemsRaw.map(i => i?.productSlug).filter(Boolean);
    const productIds = itemsRaw.map(i => i?.productRef).filter(Boolean);
    let productsMap = new Map();
    let productsById = new Map();
    if (productSlugs.length > 0 || productIds.length > 0) {
      const orClauses = [];
      if (productSlugs.length > 0) orClauses.push({ slug: { $in: productSlugs } });
      if (productIds.length > 0) orClauses.push({ _id: { $in: productIds } });
      const products = await Product.find({ $or: orClauses }).lean();
      productsMap = new Map(products.map(p => [p.slug, p]));
      productsById = new Map(products.map(p => [String(p._id), p]));
    }
    const sortedItems = [...itemsRaw].sort((a, b) => (a?.position || 999) - (b?.position || 999));
    const podiumMedals = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return (
      <div className={leagueSpartan.className} style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0a0a0a 0%, #181818 100%)', paddingTop: '6rem', paddingBottom: '3rem' }}>
        <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-2xl">🏆</span>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Top Produse</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-white leading-tight">{top.title}</h1>
            {top.description && (
              <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">{top.description}</p>
            )}
          </div>

          {sortedItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">Nu există produse în acest top.</p>
            </div>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {sortedItems.filter(item => item.position <= 3).length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-8 text-center">🏆 Podium</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(position => {
                      const item = sortedItems.find(i => i.position === position);
                      if (!item) return null;
                      const product = item?.productSlug ? productsMap.get(item.productSlug) : productsById.get(String(item.productRef));
                      if (!product) return null;
                      const imageSrc = (product.images && product.images.length) ? product.images[0] : (product.image || null);
                      const medalColors = [
                        'from-yellow-400/30 to-yellow-600/10 border-yellow-400/30',
                        'from-gray-300/30 to-gray-500/10 border-gray-400/30',
                        'from-amber-500/30 to-amber-700/10 border-amber-500/30'
                      ];
                      return (
                        <div key={position} className={`relative p-6 rounded-2xl border bg-gradient-to-br ${medalColors[position-1]} shadow-lg hover:scale-105 transition-all duration-300`}>
                          <div className="absolute top-4 left-4 z-10">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                              <span className="text-2xl">{podiumMedals[position]}</span>
                              <span className="text-sm font-bold text-yellow-400">#{position}</span>
                            </div>
                          </div>
                          {imageSrc && (
                            <div className="mb-6 flex justify-center">
                              <SmartImage src={imageSrc} alt={product.name} width={position === 1 ? 220 : 160} height={position === 1 ? 220 : 160} className="rounded-xl object-contain" />
                            </div>
                          )}
                          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white text-center">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm sm:text-base text-white/60 mb-4 text-center line-clamp-3 leading-relaxed">{product.description}</p>
                          )}
                          {item.customNote && (
                            <div className="mb-4 p-4 rounded-lg bg-black/30 border border-white/10">
                              <p className="text-sm text-white/80 italic leading-relaxed">“{item.customNote}”</p>
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-4 mt-6">
                            {product.price && (
                              <span className="text-2xl sm:text-3xl font-bold text-white">
                                {product.price.toLocaleString('ro-RO')} <span className="text-lg text-white/60">RON</span>
                              </span>
                            )}
                            <a href={`/products/${product.slug}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                              Vezi detalii
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Remaining Products */}
              {sortedItems.filter(item => item.position > 3).length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-center">📋 Clasament complet</h2>
                  <div className="space-y-4">
                    {sortedItems.filter(item => item.position > 3).map((item) => {
                      const product = item?.productSlug ? productsMap.get(item.productSlug) : productsById.get(String(item.productRef));
                      if (!product) return null;
                      const img = (product.images && product.images.length) ? product.images[0] : (product.image || null);
                      return (
                        <div key={item.position} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors items-center">
                          <div className="flex-shrink-0 w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                            <span className="font-bold text-yellow-500">{item.position}</span>
                          </div>
                          {img && (
                            <div className="flex-shrink-0">
                              <SmartImage src={img} alt={product.name} width={80} height={80} className="rounded-lg object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-1 text-white">{product.name}</h3>
                            {product.description && (
                              <p className="text-slate-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                            )}
                            {item.customNote && (
                              <p className="text-sm italic text-slate-300 mb-2">“{item.customNote}”</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              {product.price && (
                                <span className="text-lg font-semibold text-yellow-500">{product.price.toLocaleString('ro-RO')} RON</span>
                              )}
                              <a href={`/products/${product.slug}`} className="text-yellow-500 hover:underline font-medium">Vezi detalii →</a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": top.title,
                "description": top.description,
                "numberOfItems": sortedItems.length,
                "itemListElement": sortedItems.map((item, index) => {
                  const product = item?.productSlug ? productsMap.get(item.productSlug) : productsById.get(String(item.productRef));
                  if (!product) return null;
                  return {
                    "@type": "ListItem",
                    "position": item.position,
                    "item": {
                      "@type": "Product",
                      "name": product.name,
                      "description": product.description,
                      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pcaffiliate.ro'}/products/${product.slug}`,
                      ...(product.images && product.images[0] && { "image": product.images[0] }),
                      ...(product.price && { "offers": { "@type": "Offer", "price": product.price, "priceCurrency": "RON" } })
                    }
                  };
                }).filter(Boolean)
              })
            }}
          />
        </div>
      </div>
    );
  } catch (err) {
    console.error('[page]/tops/[slug] error', err);
    return (
      <div className={`container px-6 pb-12 pt-32 sm:pt-36 text-center ${leagueSpartan.className}`}>
        <h1 className="text-2xl font-semibold mb-4">Eroare</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea topului.</p>
      </div>
    );
  }
}
