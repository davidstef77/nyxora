import connect from '../../lib/db';
import Product from '../../lib/models/Product';

async function findProduct(slug) {
  await connect();
  return Product.findOne({ slug }).lean();
}

export async function GET(request, { params }) {
  const slug = params.slug;
  const product = await findProduct(slug);
  if (!product) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(product), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request, { params }) {
  const adminKey = request.headers.get('x-admin-key');
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const data = await request.json();
    const updated = await Product.findOneAndUpdate({ slug: params.slug }, data, { new: true, upsert: false }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const adminKey = request.headers.get('x-admin-key');
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const res = await Product.findOneAndDelete({ slug: params.slug });
    if (!res) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
