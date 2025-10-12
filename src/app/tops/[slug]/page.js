import connect from '../../api/lib/db';
import Top from '../../api/lib/models/Top';
import Product from '../../api/lib/models/Product';
import Link from 'next/link';

export default async function TopDetail({ params }) {
  try {
    await connect();
    const { slug } = params;
    const t = await Top.findOne({ slug, published: true }).lean();
    if (!t) return (<div className="container px-6 py-12"><h1>Top negăsit</h1></div>);

    // resolve product refs if present
    let items = t.items || [];
    const productIds = items.filter(i => i.productRef).map(i => i.productRef);
    let productsMap = new Map();
    if (productIds.length > 0) {
      const prods = await Product.find({ _id: { $in: productIds } }).lean();
      productsMap = new Map(prods.map(p => [String(p._id), p]));
    }

    return (
      <div className="container px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">{t.title}</h1>
        {t.description && <p className="text-slate-300 mb-6">{t.description}</p>}
        <ol className="list-decimal pl-6 space-y-4">
          {items.map((it, idx) => (
            <li key={idx}>
              <div className="font-semibold">{it.title || (productsMap.get(String(it.productRef))?.name) || 'Item'}</div>
              {it.description && <div className="text-slate-400">{it.description}</div>}
              {it.productRef && productsMap.get(String(it.productRef)) && (
                <div className="mt-1"><Link href={`/products/${productsMap.get(String(it.productRef)).slug}`} className="text-[var(--accent)]">Vezi produs</Link></div>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  } catch (err) {
    console.error('[page]/tops/[slug] error', err);
    return (<div className="container px-6 py-12"><h1>Eroare</h1></div>);
  }
}
