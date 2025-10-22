import connect from '../lib/db';
import Category from '../lib/models/Category';
import { revalidatePath } from 'next/cache';

export async function GET() {
  await connect();
  const categories = await Category.find().lean();
  return new Response(JSON.stringify({ categories }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  const adminKey = request.headers.get('x-admin-key');
  if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const body = await request.json();
    const cat = await Category.create(body);
    
    // Invalidează cache-ul homepage-ului și a paginii de categorii
    revalidatePath('/');
    revalidatePath('/categories/[slug]', 'page');
    
    return new Response(JSON.stringify(cat), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
