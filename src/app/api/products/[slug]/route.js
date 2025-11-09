import connect from '../../lib/db';
import Product from '../../lib/models/Product';
import { revalidatePath } from 'next/cache';
import { isAuthorized } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    await connect();
    const { slug } = params;
    const p = await Product.findOne({ slug }).lean();
    if (!p) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ product: p }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/products/[slug]] GET error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const { slug } = params;
    const body = await request.json();

    // Ensure we don't accidentally replace _id or createdAt from client
    const update = { ...body };
    delete update._id;
    delete update.createdAt;
    delete update.updatedAt;

    const updated = await Product.findOneAndUpdate({ slug }, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    // Invalidează cache-ul homepage-ului și a paginii produsului
    revalidatePath('/');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/products');
    
    return new Response(JSON.stringify({ product: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/products/[slug]] PUT error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const { slug } = params;
    const res = await Product.findOneAndDelete({ slug }).lean();
    if (!res) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    // Invalidează cache-ul homepage-ului și a paginii produsului
    revalidatePath('/');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/products');
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('[api/products/[slug]] DELETE error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
