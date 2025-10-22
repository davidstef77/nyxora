import Image from '../../../components/SmartImage';
import Link from 'next/link';
import ProductsForCategory from '../../../components/ProductsForCategory';
import connect from '../../api/lib/db';
import Category from '../../api/lib/models/Category';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getData(slug) {
  try {
    await connect();
    const category = await Category.findOne({ slug }).lean();
    return { category };
  } catch (err) {
    console.error('[categories/[slug]] getData error', err);
    return { category: null, error: err.message };
  }
}

export default async function CategoryPage({ params }) {
  try {
    const p = await params;
    const { category, error } = await getData(p.slug);

    if (error || !category) {
      return (
        <div className="container p-8">
          <h1 className="text-2xl font-semibold">Categorie negăsită</h1>
          {error && <p className="text-slate-400 mt-2">Eroare: {error}</p>}
          <Link href="/" className="text-cyan-400 mt-4 block">Înapoi la listă</Link>
        </div>
      );
    }

    return (
      <>
        {/* Full-bleed header: placed outside the centered container so it spans the viewport */}
        <div className="relative w-full h-80 mb-8 overflow-hidden full-bleed-header">
          <Image src={category.icon || '/placeholder-product.svg'} alt={category.name} fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-6 bottom-6">
            <h1 className="font-bold text-white drop-shadow-lg heading-shimmer">{category.name}</h1>
            {category.description && <p className="text-slate-200 mt-3 max-w-2xl text-lg">{category.description}</p>}
          </div>
        </div>

        <main className="container p-0">
          {/* Content stays centered inside the container */}
          <section className="container">
            <ProductsForCategory categorySlug={category.slug} />
          </section>

          <div className="mt-6">
            <Link href="/" className="text-cyan-400">Înapoi</Link>
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
          <p className="text-slate-300 mb-4">Vezi produsele din această categorie.</p>
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
                    <p className="text-sm text-slate-300 mt-1">{p.displayPrice || 'Preț nedefinit'}</p>
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
