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
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="rounded-lg bg-yellow-900/80 border border-yellow-800 text-yellow-100 p-4">
            <strong>Conexiune DB eșuată:</strong> {dbError}
            <div className="mt-2 text-sm">
              Cel mai frecvent motiv: adresa ta IP nu este adăugată în Atlas Network Access (whitelist). Verifică: <a className="underline text-yellow-200" href="https://www.mongodb.com/docs/atlas/security-whitelist/" target="_blank" rel="noreferrer">mongodb.com/docs/atlas/security-whitelist</a>
            </div>
          </div>
        </div>
      )}

      <Hero imageSrc="/next.svg" imageAlt="Găsește laptopuri, telefoane și componente" />

      {/* Spacer pentru separare vizuală */}
      <div className="h-8 sm:h-12 lg:h-16"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Secțiunea Categorii cu spacing îmbunătățit */}
        <section id="categories" className="py-12 sm:py-16 lg:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full text-cyan-400 text-sm font-medium mb-4">
              CATEGORII POPULARE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Explorează <span className="text-cyan-400">Categoriile</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Descoperă cele mai bune produse organizate pe categorii pentru a găsi exact ce cauți
            </p>
          </div>

          <div className="mobile-grid gap-6 sm:gap-8 lg:gap-10">
            {categories.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} 
                className="group rounded-xl bg-slate-800 p-6 sm:p-8 lg:p-10 
                  hover:scale-[1.02] transform transition-all duration-300 
                  shadow-lg hover:shadow-xl hover:shadow-cyan-900/20 
                  active:scale-[0.98] block border border-slate-700
                  hover:border-cyan-900/30 relative overflow-hidden"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                
                {/* Card content */}
                <div className="space-y-4 sm:space-y-5 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-cyan-400 text-lg sm:text-xl lg:text-2xl group-hover:text-cyan-300 transition-colors">{c.name}</h3>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Separator simplu */}
        <div className="border-t border-slate-700 my-12 sm:my-16 lg:my-20"></div>

        {/* Secțiunea Produse cu spacing îmbunătățit */}
        <section id="products" className="py-16 sm:py-20 lg:py-28">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full text-cyan-400 text-sm font-medium mb-4">
              OFERTE SPECIALE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Produse <span className="text-cyan-400">Recomandate</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Laptopuri, telefoane, procesoare, plăci video, SSD-uri și alte componente. 
              Vezi topuri, recenzii și oferte actualizate zilnic.
            </p>
          </div>

          <div className="mobile-grid gap-6 sm:gap-8 lg:gap-10">
            {featuredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 sm:py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2H5V5" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-lg">Momentan nu există produse recomandate.</p>
                  <p className="text-slate-500 text-sm mt-2">Revino în curând pentru actualizări!</p>
                </div>
              </div>
            )}

            {featuredProducts.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700 hover:border-slate-600">
                  <div className="relative">
                    {/* Product image container */}
                    <div className="w-full h-52 sm:h-56 md:h-60 lg:h-64 relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      <Image 
                        src={p.image || ''} 
                        alt={p.name} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        className="group-hover:scale-110 transition-transform duration-500" 
                      />
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    </div>
                    
                    {/* Top badges */}
                    <div className="absolute left-0 top-0 m-4 flex flex-col gap-2">
                      <div className="bg-black/60 text-xs text-white px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium border border-white/10 shadow-lg flex items-center">
                        <svg className="w-4 h-4 mr-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {p.displayPrice || 'Preț variabil'}
                      </div>
                    </div>
                    
                    {/* Favorite button */}
                    <div className="absolute right-0 top-0 m-4">
                      <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm border border-white/10 shadow-lg">
                        <FavoriteButton productSlug={p.slug} size={28} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                    
                    {/* CTA button */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-cyan-400 font-semibold text-lg">
                          {p.displayPrice || 'Preț variabil'}
                        </div>
                        <div className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-cyan-500 transition-all duration-300 shadow-sm group-hover:shadow flex items-center">
                          Vezi Oferta
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Call to Action final */}
        <section className="py-20 sm:py-24 lg:py-28 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-slate-800 rounded-2xl p-8 sm:p-12 lg:p-16 border border-slate-700 shadow-xl relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-cyan-400"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-2 bg-cyan-600/20 rounded-full mb-6">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Nu ai găsit ce cauți?
                </h2>
                
                <p className="text-lg sm:text-xl text-slate-300 mb-10 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
                  Explorează toate categoriile sau vezi topurile noastre pentru a găsi produsele perfecte pentru tine
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 justify-center">
                  <Link 
                    href="/products" 
                    className="bg-cyan-600 hover:bg-cyan-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-600/20 group"
                  >
                    <span className="text-white text-lg flex items-center justify-center">
                      Vezi Toate Produsele
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link 
                    href="/tops" 
                    className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-white text-lg flex items-center justify-center">
                      Topuri Săptămânale
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer legal text removed per request */}
    </div>
  );
}