import connect from '../lib/db';
import Product from '../lib/models/Product';

/**
 * GET: list products, optionally filtered by ?category=slug
 * POST: create a new product (expects JSON body), protected by x-admin-key
 */
export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const filter = {};
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
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
    const prod = await Product.create(body);
    return new Response(JSON.stringify(prod), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
