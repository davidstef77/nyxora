import Image from '../../../components/SmartImage';
import Link from 'next/link';
import ProductsForCategory from '../../../components/ProductsForCategory';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const url = new URL('/api/data', base.startsWith('http') ? base : `https://${base}`);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function CategoryPage({ params }) {
  try {
    const { categories, manufacturers, featuredProducts } = await getData();
    const category = categories.find((c) => c.slug === params.slug);

    if (!category) {
      return (
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-semibold">Categorie negăsită</h1>
          <Link href="/" className="text-cyan-400 mt-4 block">Înapoi la listă</Link>
        </div>
      );
    }

    // filter manufacturers that belong to this category (by slug)
    const brands = manufacturers.filter((m) => m.category === category.slug);

    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-slate-800/50 rounded-lg overflow-hidden flex items-center justify-center">
            <Image src={category.icon} alt={category.name} width={80} height={80} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-slate-300">{category.description}</p>
          </div>
        </div>

        {/* Manufacturers (brands) shown first */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Firme producătoare</h2>
          {brands.length === 0 ? (
            <p className="text-slate-400">Nu există firme înregistrate pentru această categorie.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brands.map((b) => (
                <Link key={b.slug} href={`/manufacturers/${b.slug}`} className="rounded-lg bg-slate-800/50 p-4 flex flex-col items-center text-center hover:shadow-lg">
                  <div className="w-20 h-20 mb-3 overflow-hidden rounded-md">
                    <Image src={b.logo} alt={b.name} width={80} height={80} style={{ objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">{b.name}</div>
                    {b.description && <div className="text-sm text-slate-300 mt-1">{b.description}</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Products are revealed after user intent (button) */}
        <section>
          <ProductsForCategory categorySlug={category.slug} />
        </section>

        <div className="mt-6">
          <Link href="/" className="text-cyan-400">Înapoi</Link>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-semibold">Eroare la încărcare</h1>
        <p className="text-slate-300">{String(err)}</p>
      </div>
    );
  }
}

// Client component to fetch and reveal products on user action
function ProductsForCategoryPlaceholder({ categorySlug }) {
  const [show, setShow] = useState(false);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const url = new URL(`/api/products?category=${encodeURIComponent(categorySlug)}`, base.startsWith('http') ? base : `https://${base}`);
      const res = await fetch(url.toString());
      const json = await res.json();
      setProducts(json.products || []);
    } catch (err) {
      console.error('loadProducts error', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setShow(true);
    }
  }

  return (
    <div>
      {!show ? (
        <div className="panel p-6">
          <p className="text-slate-300 mb-4">Vezi produsele din această categorie — mai întâi vezi firmele producătoare.</p>
          <button onClick={loadProducts} className="btn-primary">Arată Produse</button>
        </div>
      ) : (
        <div>
          {loading && <p className="text-slate-400">Se încarcă...</p>}
          {!loading && products && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {products.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
                  <div className="w-full h-40 relative">
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
      )}
    </div>
  );
}
