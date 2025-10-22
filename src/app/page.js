import Image from '../components/SmartImage';
import FavoriteButton from '../components/FavoriteButton';
import Link from 'next/link';
import Hero from '../components/Hero';
import connect from './api/lib/db';
import Product from './api/lib/models/Product';
import Category from './api/lib/models/Category';

// Revalidează homepage-ul la fiecare 60 secunde
export const revalidate = 60;

// Forțează rendering dinamic (nu static) pentru a evita probleme de cache
export const dynamic = 'force-dynamic';

async function getData() {
  try {
    await connect();
  } catch (err) {
    console.error('[page] getData error - cannot connect to DB', err);
    return { categories: [], featuredProducts: [], dbError: err && err.message ? err.message : String(err) };
  }

  try {
    const categories = await Category.find().lean();
    const featuredProducts = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
    return { categories, featuredProducts };
  } catch (err) {
    console.error('[page] getData error fetching data', err);
    return { categories: [], featuredProducts: [], dbError: err && err.message ? err.message : String(err) };
  }
}

export default async function Home() {
  const { categories, featuredProducts, dbError } = await getData();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {dbError && (
        <div className="container px-6 py-4">
          <div className="rounded-lg bg-yellow-900/80 border border-yellow-800 text-yellow-100 p-3">
            <strong>Conexiune DB eșuată:</strong> {dbError}
            <div className="mt-2 text-sm">
              Cel mai frecvent motiv: adresa ta IP nu este adăugată în Atlas Network Access (whitelist). Verifică: <a className="underline text-yellow-200" href="https://www.mongodb.com/docs/atlas/security-whitelist/" target="_blank" rel="noreferrer">mongodb.com/docs/atlas/security-whitelist</a>
            </div>
          </div>
        </div>
      )}

      <Hero imageSrc="/next.svg" imageAlt="Găsește laptopuri, telefoane și componente" />

      <main className="container px-4 sm:px-6 py-8 sm:py-16">
        <section id="categories" className="mobile-grid mb-8 sm:mb-12">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 sm:p-8 hover:scale-[1.02] transform transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] block border border-white/5">
              <div>
                <h3 className="font-semibold text-cyan-300 text-lg sm:text-xl md:text-2xl mb-2">{c.name}</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{c.description}</p>
              </div>
            </Link>
          ))}
        </section>

        <section id="products" className="mb-8 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-slate-100">Produse Recomandate — laptopuri, telefoane și componente</h2>
          <p className="text-slate-400 mb-4">Vezi topuri, recenzii și oferte pentru laptopuri, telefoane, procesoare, plăci video, SSD-uri și alte componente.</p>

          <div className="mobile-grid">
            {featuredProducts.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-8">Momentan nu există produse recomandate.</p>
            )}

            {featuredProducts.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] border border-white/10">
                  <div className="w-full h-48 sm:h-52 md:h-56 relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                    <Image src={p.image || ''} alt={p.name} fill style={{ objectFit: 'cover' }} className="group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute right-3 top-3">
                      <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                        <FavoriteButton productSlug={p.slug} size={28} />
                      </div>
                    </div>
                    <div className="absolute left-3 top-3 bg-black/60 text-xs text-white px-2.5 py-1.5 rounded-full backdrop-blur-sm font-medium">{p.displayPrice || '—'}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute left-3 bottom-3 right-3">
                      <div className="bg-cyan-500/95 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm text-center">
                        Vezi Detalii
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-slate-100 text-base sm:text-lg mb-2 line-clamp-2">{p.name}</h3>
                    {p.description && <p className="text-slate-400 text-sm line-clamp-2 sm:line-clamp-3">{p.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer legal text removed per request */}
    </div>
  );
}