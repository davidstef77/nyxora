import Link from 'next/link'
import Image from '../../components/SmartImage'
import connect from '../api/lib/db'
import Product from '../api/lib/models/Product'
import Category from '../api/lib/models/Category'

function parsePriceToNumber(price) {
  if (price == null) return null
  // Try to extract numeric part, allow commas and dots
  const m = String(price).match(/([0-9]+[\.,]?[0-9]*)/);
  if (!m) return null
  return Number(m[1].replace(',', '.'))
}

export default async function ProductsPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const categoryFilter = (searchParams?.category || '').trim();
  const minPrice = searchParams?.minPrice ? Number(searchParams.minPrice) : null;
  const maxPrice = searchParams?.maxPrice ? Number(searchParams.maxPrice) : null;

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

    // Best-effort numeric price filtering on server: parse product.price strings
    if (minPrice != null || maxPrice != null) {
      products = products.filter((p) => {
        const n = parsePriceToNumber(p.price);
        if (n == null) return false; // skip items without numeric price
        if (minPrice != null && n < minPrice) return false;
        if (maxPrice != null && n > maxPrice) return false;
        return true;
      });
    }

    return (
      <main className="container mx-auto p-8">
        <div className="flex items-start gap-8">
          {/* Left filters - visible on md+ (desktop) only */}
          <aside className="hidden md:block w-64">
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
                    <input name="minPrice" defaultValue={searchParams?.minPrice || ''} placeholder="Min" className="flex-1 bg-slate-800/40 border border-slate-700 px-2 py-2 rounded-md text-slate-100" />
                    <input name="maxPrice" defaultValue={searchParams?.maxPrice || ''} placeholder="Max" className="flex-1 bg-slate-800/40 border border-slate-700 px-2 py-2 rounded-md text-slate-100" />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full">Aplică filtre</button>
                </div>
              </form>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Produse</h1>
                <p className="text-slate-400">Explorează produsele disponibile{q ? ` — căutare: ${q}` : ''}</p>
              </div>

              <form method="get" className="flex items-center gap-2">
                <label htmlFor="q" className="sr-only">Caută</label>
                <input id="q" name="q" defaultValue={q} placeholder="Caută componente..." className="px-3 py-2 rounded-md bg-slate-800/40 border border-slate-700 text-slate-100" />
                <button type="submit" className="btn-primary">Caută</button>
              </form>
            </div>

            {products.length === 0 ? (
              <div className="panel p-6">Nu există produse care să corespundă căutării.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
                    <div className="w-full h-44 relative">
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-100">{p.name}</h3>
                      <p className="text-sm text-slate-300 mt-1">{p.price}</p>
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
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-semibold">Eroare la încărcare</h1>
        <p className="text-slate-300">{String(err)}</p>
      </div>
    )
  }
}
