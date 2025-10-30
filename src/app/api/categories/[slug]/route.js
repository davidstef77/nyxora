import connect from '../../lib/db';
import Category from '../../lib/models/Category';
import { revalidatePath } from 'next/cache';

function sanitizeKey(v) {
  if (!v) return '';
  let s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export async function GET(request, { params }) {
  await connect();
  const p = await params;
  const cat = await Category.findOne({ slug: p.slug }).lean();
  if (!cat) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(cat), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request, { params }) {
  const adminKey = request.headers.get('x-admin-key');
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const data = await request.json();
  const p = await params;
  const updated = await Category.findOneAndUpdate({ slug: p.slug }, data, { new: true }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    // Invalidează cache-ul homepage-ului și a paginii categoriei
    revalidatePath('/');
    revalidatePath(`/categories/${p.slug}`);
    
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const url = new URL(request.url);
  // Support both header x-admin-key and legacy ?adminKey= query param
  const headerKey = sanitizeKey(request.headers.get('x-admin-key'));
  const queryKey = sanitizeKey(url.searchParams.get('adminKey'));
  const providedKey = headerKey || queryKey;
  const envKey = sanitizeKey(process.env.ADMIN_KEY);
  if (envKey && envKey !== providedKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
  const p = await params;
  const res = await Category.findOneAndDelete({ slug: p.slug });
    if (!res) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    // Invalidează cache-ul homepage-ului și a paginii categoriei
    revalidatePath('/');
    revalidatePath(`/categories/${p.slug}`);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    // include the message for easier debugging in development
    const msg = err && err.message ? err.message : String(err);
    const body = { error: msg };
    if (process.env.NODE_ENV !== 'production' && err && err.stack) body.stack = err.stack;
    return new Response(JSON.stringify(body), { status: 500 });
  }
}
