import Link from 'next/link';
import connect from '../api/lib/db';
import Category from '../api/lib/models/Category';
import { League_Spartan } from 'next/font/google';

const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: ['400','500','600','700'] });

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export const metadata = {
  title: 'Categorii Produse | Nyxora',
  description: 'Explorează toate categoriile de produse: laptopuri, componente PC, telefoane și multe altele.',
  alternates: { canonical: 'https://www.nyxora.ro/categories' },
  openGraph: {
    title: 'Categorii Produse | Nyxora',
    description: 'Listă de categorii pentru produse tech și componente PC.',
    url: 'https://www.nyxora.ro/categories',
    type: 'website'
  },
  robots: { index: true, follow: true }
};

async function getCategories() {
  try {
    await connect();
    const categories = await Category.find().select('name slug description icon updatedAt').lean();
    return categories;
  } catch (e) {
    console.error('[categories index] error', e);
    return [];
  }
}

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Categorii Produse',
    description: 'Listă de categorii pe Nyxora',
    url: 'https://www.nyxora.ro/categories',
    hasPart: categories.map(c => ({
      '@type': 'Thing',
      name: c.name,
      url: `https://www.nyxora.ro/categories/${c.slug}`
    }))
  };

  return (
    <div className={`container px-6 pb-16 pt-28 sm:pt-32 ${leagueSpartan.className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Categorii</h1>
      {categories.length === 0 ? (
        <p className="text-slate-400">Nu există categorii disponibile.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <h2 className="text-lg font-semibold mb-2 group-hover:text-yellow-400 transition-colors">{c.name}</h2>
              {c.description && <p className="text-sm text-slate-300 line-clamp-3">{c.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
