import connect from '../lib/db';
import Product from '../lib/models/Product';
import { revalidatePath } from 'next/cache';

/**
 * GET: list products, optionally filtered by ?category=slug
 * POST: create a new product (expects JSON body), protected by x-admin-key
 */
export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const slugsParam = url.searchParams.get('slugs');

    const filter = {};
    if (category) filter.category = category;

    // If explicit slugs requested, return those products in the same order
    if (slugsParam) {
      const slugs = String(slugsParam).split(',').map(s => s.trim()).filter(Boolean);
      if (slugs.length === 0) return new Response(JSON.stringify({ products: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      const prods = await Product.find({ slug: { $in: slugs } }).lean();
      // preserve requested order
      const productsMap = new Map(prods.map(p => [p.slug, p]));
      const ordered = slugs.map(s => productsMap.get(s)).filter(Boolean);
      return new Response(JSON.stringify({ products: ordered }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    // Compute displayPrice/displayPriceValue from the first affiliate link when present
    function parsePriceToNumber(price) {
      if (price == null) return null;
      const m = String(price).match(/([0-9]+[\.,]?[0-9]*)/);
      if (!m) return null;
      return Number(m[1].replace(',', '.'));
    }

    products = products.map((p) => {
      const links = Array.isArray(p.affiliateLinks) ? p.affiliateLinks : [];
      const firstLinkPrice = links.length > 0 && links[0] && links[0].price ? String(links[0].price) : null;
      const fallbackPrice = p.displayPrice || p.price || null;
      const displayPrice = firstLinkPrice || fallbackPrice || null;
      const displayPriceValue = (firstLinkPrice ? parsePriceToNumber(firstLinkPrice) : (typeof p.displayPriceValue === 'number' ? p.displayPriceValue : parsePriceToNumber(fallbackPrice)));
      return { ...p, displayPrice, displayPriceValue };
    });

    // Manufacturer lookups removed; products are returned as stored with computed price hints
    return new Response(JSON.stringify({ products }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/products] error', err);
    return new Response(JSON.stringify({ products: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  // header-based admin key
  const adminKey = request.headers.get('x-admin-key');
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const body = await request.json();

    // Manufacturer creation/upsert removed — incoming payload will be stored as-is
    const productDoc = { ...body };

    const prod = await Product.create(productDoc);

    // manufacturer price handling removed
    
    // Invalidează cache-ul homepage-ului pentru a afișa noul produs
    revalidatePath('/');
    revalidatePath('/products');

    return new Response(JSON.stringify(prod), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
