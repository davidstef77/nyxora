import Image from '../components/SmartImage';
import Link from 'next/link';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import connect from './api/lib/db';
import Product from './api/lib/models/Product';
import Category from './api/lib/models/Category';

async function getData() {
  try {
    await connect();
    const categories = await Category.find().lean();
    const featuredProducts = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
    return { categories, featuredProducts };
  } catch (err) {
    console.error('[page] getData error', err);
    return { categories: [], featuredProducts: [] };
  }
}

export default async function Home() {
  const { categories, featuredProducts } = await getData();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />

      <Hero imageSrc="/next.svg" imageAlt="Configurare PC high-end cu GPU și procesor" />

      <main className="container mx-auto px-6 py-16">
        <section id="categories" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-8 hover:scale-102 transform transition-shadow shadow-sm hover:shadow-lg block">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image src={c.icon} alt={c.name} width={64} height={64} className="object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300 text-lg sm:text-xl md:text-2xl">{c.name}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-slate-300">{c.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section id="products" className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-slate-100">Produse Recomandate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
                <div className="w-full h-40 relative">
                  <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-100">{p.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{p.price}</p>
                  <div className="mt-4">
                    <span className="block w-full text-center bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg">Vezi Detalii</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
        <div className="container mx-auto px-6 text-center" style={{ color: 'var(--muted-text)' }}>
          <p>© {new Date().getFullYear()} Nyxora.ro — Toate drepturile rezervate</p>
          <div className="mt-3 space-x-4">
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">Termeni & Condiții</Link>
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">Politica de Confidențialitate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}