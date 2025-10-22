import Link from 'next/link'
import Image from '../../components/SmartImage'
import FavoriteButton from '../../components/FavoriteButton'
import connect from '../api/lib/db'
import Product from '../api/lib/models/Product'
import Category from '../api/lib/models/Category'
// Manufacturer references removed — brand data no longer displayed

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 30;

export const metadata = {
  title: 'Produse - Recenzii și Comparații | Nyxora',
  description: 'Descoperă cele mai bune produse tech pe Nyxora. Recenzii detaliate, comparații de preț și recomandări pentru componente PC, laptopuri, periferice și multe altele.',
  keywords: 'produse tech, recenzii, comparații preț, componente PC, laptopuri, periferice, recomandări',
  authors: [{ name: 'Nyxora' }],
  openGraph: {
    type: 'website',
    siteName: 'Nyxora',
    title: 'Produse Tech - Recenzii și Comparații | Nyxora',
    description: 'Găsește cele mai bune produse tech cu recenzii detaliate și comparații de preț pe Nyxora.',
    url: 'https://nyxora.ro/products',
    images: [{ url: 'https://nyxora.ro/og-image.png', width: 1200, height: 630 }],
    locale: 'ro_RO'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nyxora',
    title: 'Produse Tech - Nyxora',
    description: 'Descoperă cele mai bune produse tech cu recenzii și comparații de preț.',
    images: ['https://nyxora.ro/og-image.png']
  },
  alternates: {
    canonical: 'https://nyxora.ro/products'
  },
  robots: 'index,follow,max-snippet:-1,max-image-preview:large'
};

function parsePriceToNumber(price) {
  if (price == null) return null
  // Try to extract numeric part, allow commas and dots
  const m = String(price).match(/([0-9]+[\.,]?[0-9]*)/);
  if (!m) return null
  return Number(m[1].replace(',', '.'))
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams; // await searchParams for Next.js 15+
  const q = (params?.q || '').trim();
  const categoryFilter = (params?.category || '').trim();
  const minPrice = params?.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : null;

  try {
    await connect();

    // fetch categories for the left filter sidebar
    const categories = await Category.find().lean();

    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: re },
        { description: re }
      ];
    }
    if (categoryFilter) filter.category = categoryFilter;

    let products = await Product.find(filter).sort({ createdAt: -1 }).limit(200).lean();

    // Use first affiliate link price as the product display price when available.
    // Also compute a numeric `displayPriceValue` to support numeric filtering.
    products = products.map((p) => {
      const links = Array.isArray(p.affiliateLinks) ? p.affiliateLinks : [];
      const firstLinkPrice = links.length > 0 && links[0] && links[0].price ? String(links[0].price) : null;
      const fallbackPrice = p.displayPrice || p.price || null;
      const displayPrice = firstLinkPrice || fallbackPrice || null;
      const displayPriceValue = (firstLinkPrice ? parsePriceToNumber(firstLinkPrice) : (typeof p.displayPriceValue === 'number' ? p.displayPriceValue : parsePriceToNumber(fallbackPrice)));
      return { ...p, displayPrice, displayPriceValue };
    });

    // Numeric price filtering using computed displayPriceValue
    if (minPrice != null || maxPrice != null) {
      products = products.filter((p) => {
        const n = typeof p.displayPriceValue === 'number' ? p.displayPriceValue : null;
        if (n == null) return false; // skip items without numeric price
        if (minPrice != null && n < minPrice) return false;
        if (maxPrice != null && n > maxPrice) return false;
        return true;
      });
    }

    return (
      <main className="container p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left filters - collapsible on mobile, sidebar on desktop */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="panel p-4 mb-6">
              <h3 className="font-semibold mb-3">Filtre</h3>
              <form method="get" className="flex flex-col gap-3">
                <div>
                  <label htmlFor="category" className="block text-sm text-slate-300 mb-1">Categorie</label>
                  <select id="category" name="category" defaultValue={categoryFilter} className="w-full bg-slate-800/40 border border-slate-700 px-2 py-2 rounded-md text-slate-100">
                    <option value="">Toate categoriile</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Preț (RON)</label>
                  <div className="flex gap-2">
                    <input name="minPrice" defaultValue={params?.minPrice || ''} placeholder="Min" className="w-20 sm:w-24 bg-slate-800/40 border border-slate-700 px-2 py-2 rounded-md text-slate-100" />
                    <input name="maxPrice" defaultValue={params?.maxPrice || ''} placeholder="Max" className="w-20 sm:w-24 bg-slate-800/40 border border-slate-700 px-2 py-2 rounded-md text-slate-100" />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full">Aplică filtre</button>
                </div>
              </form>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">Produse</h1>
                <p className="text-slate-400 text-sm sm:text-base">Explorează produsele disponibile{q ? ` — căutare: ${q}` : ''}</p>
              </div>

              <form method="get" className="flex items-center gap-2 flex-shrink-0">
                <label htmlFor="q" className="sr-only">Caută</label>
                <input id="q" name="q" defaultValue={q} placeholder="Caută componente..." className="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 text-slate-100 text-sm sm:text-base w-full sm:w-auto min-w-0" />
                <button type="submit" className="btn-primary whitespace-nowrap">Caută</button>
              </form>
            </div>

            {products.length === 0 ? (
              <div className="panel p-6 text-center">
                <p className="text-slate-400 mb-2">Nu există produse care să corespundă căutării.</p>
                <Link href="/products" className="text-white hover:text-slate-200 transition-colors">Vezi toate produsele</Link>
              </div>
            ) : (
              <div className="mobile-grid">
                {products.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="group bg-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] block border border-white/5">
                    <div className="w-full h-40 sm:h-44 relative bg-slate-700/20">
                      <Image src={p.image || ''} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      <div className="absolute left-3 top-3 bg-black/60 text-xs text-white px-2.5 py-1.5 rounded-full backdrop-blur-sm font-medium">{p.displayPrice || 'Preț nedefinit'}</div>
                      <div className="absolute right-3 top-3">
                        <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                          <FavoriteButton productSlug={p.slug} size={26} />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-100 text-sm sm:text-base line-clamp-2 mb-2">{p.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">{p.description || ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
  )
  } catch (err) {
    console.error('[products page] error', err)
    return (
  <div className="container p-8">
        <h1 className="text-2xl font-semibold">Eroare la încărcare</h1>
        <p className="text-slate-300">{String(err)}</p>
      </div>
    )
  }
}
