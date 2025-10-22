import Link from 'next/link';
import connect from '../api/lib/db';
import Top from '../api/lib/models/Top';

// Forțează rendering dinamic
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function TopsListPage() {
  try {
    await connect();
    const tops = await Top.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Topuri</h1>
        {tops.length === 0 ? (
          <p className="text-slate-400">Nu există topuri publicate momentan.</p>
        ) : (
          <div className="grid gap-6">
            {tops.map((t) => (
              <article key={t.slug} className="p-4 rounded-2xl bg-white/5 border border-white/6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1">
                  <Link href={`/tops/${t.slug}`} className="hover:underline">{t.title}</Link>
                </h2>
                {t.description && <p className="text-slate-300">{t.description}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('[page]/tops error', err);
    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl font-semibold">Topuri</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea topurilor.</p>
      </div>
    );
  }
}
