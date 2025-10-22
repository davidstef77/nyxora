import connect from '../../api/lib/db';
import Top from '../../api/lib/models/Top';
import Product from '../../api/lib/models/Product';
import SmartImage from '../../../components/SmartImage';
import { Metadata } from 'next';

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

    return {
      title: `${top.title} | PC Affiliate`,
      description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experții noștri`,
      openGraph: {
        title: top.title,
        description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experții noștri`,
        type: 'article',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pcaffiliate.ro'}/tops/${top.slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: top.title,
        description: top.description || `Descoperă ${top.title} - cele mai bune produse selectate de experții noștri`
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
        <div className="container px-6 py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">Top negăsit</h1>
          <p className="text-slate-400">Topul solicitat nu există sau nu este publicat.</p>
        </div>
      );
    }

    // Sanitize items array and support legacy productRef (ObjectId) as well as new productSlug
    const itemsRaw = Array.isArray(top.items) ? top.items.filter(Boolean) : [];

    // Collect slugs and possible legacy product IDs
    const productSlugs = itemsRaw.map(i => i?.productSlug).filter(Boolean);
    const productIds = itemsRaw.map(i => i?.productRef).filter(Boolean);

    let productsMap = new Map();
    let productsById = new Map();

    if (productSlugs.length > 0 || productIds.length > 0) {
      // Build a query that finds products by either slug or _id (legacy)
      const orClauses = [];
      if (productSlugs.length > 0) orClauses.push({ slug: { $in: productSlugs } });
      if (productIds.length > 0) orClauses.push({ _id: { $in: productIds } });

  // Do not require products to have `published: true` here because some products
  // in the database may omit that field. Match by slug/_id only.
  const products = await Product.find({ $or: orClauses }).lean();
      productsMap = new Map(products.map(p => [p.slug, p]));
      productsById = new Map(products.map(p => [String(p._id), p]));
    }

    // Sort items by position (safely)
    const sortedItems = [...itemsRaw].sort((a, b) => (a?.position || 999) - (b?.position || 999));

    const podiumMedals = {
      1: '🥇',
      2: '🥈', 
      3: '🥉'
    };

    return (
      <div className="container px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">{top.title}</h1>
        {top.description && (
          <p className="text-slate-300 mb-8 text-center max-w-2xl mx-auto">{top.description}</p>
        )}

        {sortedItems.length === 0 ? (
          <p className="text-slate-400 text-center">Nu există produse în acest top.</p>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Podium Style for Top 3 */}
            {sortedItems.filter(item => item.position <= 3).length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-8 text-center">🏆 Podium</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(position => {
                    const item = sortedItems.find(i => i.position === position);
                    if (!item) return null;

                    const product = item?.productSlug ? productsMap.get(item.productSlug) : productsById.get(String(item.productRef));
                    if (!product) return null;

                    const imageSrc = (product.images && product.images.length) ? product.images[0] : (product.image || null);

                    return (
                      <div
                        key={position}
                        className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                          position === 1 
                            ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-400/30 shadow-yellow-400/10' 
                            : position === 2
                            ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/5 border-gray-400/30 shadow-gray-400/10'
                            : 'bg-gradient-to-br from-amber-600/10 to-amber-700/5 border-amber-500/30 shadow-amber-500/10'
                        } shadow-lg`}
                      >
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">{podiumMedals[position]}</div>
                          <div className="text-lg font-semibold">Locul {position}</div>
                        </div>
                        
                        {imageSrc && (
                          <div className="mb-4 flex justify-center">
                            <SmartImage
                              src={imageSrc}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        
                        <h3 className="text-xl font-semibold mb-2 text-center">{product.name}</h3>
                        
                        {product.description && (
                          <p className="text-slate-400 text-sm mb-4 text-center line-clamp-3">
                            {product.description}
                          </p>
                        )}
                        
                        {item.customNote && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                            <p className="text-sm italic">{item.customNote}</p>
                          </div>
                        )}
                        
                        {product.price && (
                          <div className="text-center mb-4">
                            <span className="text-2xl font-bold text-[var(--accent)]">
                              {product.price.toLocaleString('ro-RO')} RON
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <a
                            href={`/products/${product.slug}`}
                            className="inline-block bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
                          >
                            Vezi detalii
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
                      <div
                        key={item.position}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-[var(--accent)]">{item.position}</span>
                        </div>
                        
                        {img && (
                          <div className="flex-shrink-0">
                            <SmartImage
                              src={img}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          {item.customNote && (
                            <p className="text-sm italic text-slate-300 mb-2">“{item.customNote}”</p>
                          )}
                          <div className="flex items-center justify-between">
                            {product.price && (
                              <span className="text-lg font-semibold text-[var(--accent)]">
                                {product.price.toLocaleString('ro-RO')} RON
                              </span>
                            )}
                            <a
                              href={`/products/${product.slug}`}
                              className="text-[var(--accent)] hover:underline font-medium"
                            >
                              Vezi detalii →
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
                    ...(product.images && product.images[0] && {
                      "image": product.images[0]
                    }),
                    ...(product.price && {
                      "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "RON"
                      }
                    })
                  }
                };
              }).filter(Boolean)
            })
          }}
        />
      </div>
    );
  } catch (err) {
    console.error('[page]/tops/[slug] error', err);
    return (
      <div className="container px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Eroare</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea topului.</p>
      </div>
    );
  }
}
