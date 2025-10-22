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

import '../categories.css';

export default async function CategoryPage({ params }) {
  try {
    const p = await params;
    const { category, error } = await getData(p.slug);

    // Debug: log pentru a vedea ce date primim
    if (category) {
      console.log('[CategoryPage] Category data:', {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description
      });
    }

    if (error || !category) {
      return (
        <div className="container p-8">
          <h1 className="text-2xl font-semibold">Categorie negăsită</h1>
          {error && <p className="text-slate-400 mt-2">Eroare: {error}</p>}
          <Link href="/" className="text-white hover:text-slate-200 mt-4 block">Înapoi la listă</Link>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Enhanced Breadcrumbs navigation */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-4 text-sm text-slate-400 py-4">
            <Link href="/" className="hover:text-cyan-400 transition-colors back-button flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Acasă
            </Link>
            <span className="breadcrumb-item">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <Link href="/" className="hover:text-cyan-400 transition-colors back-button flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Categorii
            </Link>
            <span className="breadcrumb-item">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="font-medium text-cyan-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {category.name}
            </span>
          </nav>
        </div>

        {/* Enhanced full-bleed header */}
        <div className="relative w-full h-96 sm:h-[400px] md:h-[500px] mb-8 overflow-hidden full-bleed-header">
          {category.icon ? (
            <>
              <Image 
                src={category.icon} 
                alt={category.name} 
                fill 
                style={{ objectFit: 'cover' }} 
                priority={true}
                loading="eager"
                className="category-header-image"
              />
              {/* Enhanced overlay gradient for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-cyan-900/60 flex items-center justify-center">
              <div className="text-white/80 text-center p-8">
                <div className="bg-cyan-900/30 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-base sm:text-lg backdrop-blur-sm bg-slate-900/30 px-4 py-2 rounded-full inline-block">
                  Nicio imagine setată pentru această categorie
                </p>
              </div>
            </div>
          )}

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="absolute left-4 sm:left-6 lg:left-8 bottom-8 sm:bottom-12 md:bottom-16 max-w-3xl">
              {/* Category badge */}
              <div className="inline-block px-4 py-1.5 bg-cyan-600/80 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                CATEGORIE
              </div>
              
              {/* Category title */}
              <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg heading-shimmer mb-4">
                {category.name}
              </h1>
              
              {/* Category description */}
              {category.description && (
                <div className="bg-black/40 backdrop-blur-sm rounded-lg py-3 px-4 border border-white/10">
                  <p className="text-slate-100 text-lg md:text-xl leading-relaxed">
                    {category.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          {/* Enhanced Title section */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full text-cyan-400 text-sm font-medium mb-4">
              PRODUSE DISPONIBILE
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
              Toate produsele din <span className="text-cyan-400">"{category.name}"</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Explorează gama noastră completă de produse din această categorie și găsește cele mai bune oferte
            </p>
          </div>

          {/* Content stays centered inside the container */}
          <section className="mb-16">
            <ProductsForCategory categorySlug={category.slug} />
          </section>

          {/* Enhanced Call to Action section */}
          <section className="mt-20 py-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-cyan-400"></div>
            
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
              <div className="inline-flex items-center justify-center p-2.5 bg-cyan-600/20 rounded-full mb-6 shadow-lg border border-cyan-500/10">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Dorești să explorezi mai multe produse?
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Vizitează alte categorii sau verifică topurile noastre săptămânale pentru a descoperi cele mai populare și bine cotate produse din magazinul nostru.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/" 
                  className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3.5 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-cyan-600/20 group flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Înapoi la prima pagină
                </Link>
                <Link 
                  href="/tops" 
                  className="bg-slate-700 hover:bg-slate-600 px-6 py-3.5 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Topuri Săptămânale
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
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
