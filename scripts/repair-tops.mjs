import connect from '../src/app/api/lib/db.js';
import Top from '../src/app/api/lib/models/Top.js';
import Product from '../src/app/api/lib/models/Product.js';

async function repair() {
  await connect();
  const tops = await Top.find({}).lean();
  const report = [];
  for (const t of tops) {
    const itemsRaw = Array.isArray(t.items) ? t.items : [];
    const normalized = [];
    const idsToLookup = [];
    for (const it of itemsRaw) {
      if (!it) continue;
      if (it.productSlug) {
        normalized.push({ productSlug: it.productSlug, position: Number(it.position) || (normalized.length + 1), customNote: it.customNote || '' });
      } else if (it.productRef) {
        idsToLookup.push(it.productRef);
      }
    }
    if (idsToLookup.length > 0) {
      const prods = await Product.find({ _id: { $in: idsToLookup } }).lean();
      const mapById = new Map(prods.map(p => [String(p._id), p]));
      // iterate original itemsRaw to preserve order
      for (const it of itemsRaw) {
        if (!it) continue;
        if (it.productSlug) continue; // already handled
        if (it.productRef) {
          const p = mapById.get(String(it.productRef));
          if (p) {
            normalized.push({ productSlug: p.slug, position: Number(it.position) || (normalized.length + 1), customNote: it.customNote || '' });
          }
        }
      }
    }

    if (normalized.length > 0) {
      await Top.findByIdAndUpdate(t._id, { $set: { items: normalized } }, { runValidators: true });
      report.push({ slug: t.slug, fixed: true, count: normalized.length });
    } else {
      // nothing to recover, skip
      report.push({ slug: t.slug, fixed: false, count: 0 });
    }
  }
  return report;
}

repair().then(r => { console.log('Repair report:', JSON.stringify(r, null, 2)); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });