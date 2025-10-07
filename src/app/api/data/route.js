import connect from '../lib/db';
import Product from '../lib/models/Product';
import Category from '../lib/models/Category';

export async function GET() {
  try {
    await connect();
    const categories = await Category.find().lean();
    // featuredProducts: return latest 8 products as sample
    const featuredProducts = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
    return new Response(JSON.stringify({ categories, featuredProducts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Debug: log error to server console for diagnosis
    console.error('[api/data] DB or route error:', err);
    // If DB is not available or connection failed, return safe empty lists
    return new Response(JSON.stringify({ categories: [], featuredProducts: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
