import Link from 'next/link';
import connect from '../api/lib/db';
import Blog from '../api/lib/models/Blog';

export default async function BlogListPage() {
  try {
    await connect();
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Blog</h1>
        {blogs.length === 0 ? (
          <p className="text-slate-400">Nu există articole publicate momentan.</p>
        ) : (
          <div className="grid gap-6">
            {blogs.map((b) => (
              <article key={b.slug} className="p-4 rounded-2xl bg-white/5 border border-white/6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1">
                  <Link href={`/blog/${b.slug}`} className="hover:underline">{b.title}</Link>
                </h2>
                <div className="text-sm text-slate-400 mb-2">{b.author ? `${b.author} • ` : ''}{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}</div>
                {b.excerpt && <p className="text-slate-300">{b.excerpt}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('[page]/blog error', err);
    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-red-400">A apărut o eroare la încărcarea articolelor.</p>
      </div>
    );
  }
}
