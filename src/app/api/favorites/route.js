import { getToken } from 'next-auth/jwt';
import connect from '../lib/db';
import Favorite from '../lib/models/Favorite';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request) {
  try {
    await connect();
    const token = await getToken({ req: request, secret });
    if (!token || !token.sub) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = token.sub;
    const fav = await Favorite.findOne({ userId }).lean();
    return new Response(JSON.stringify({ slugs: (fav && fav.slugs) || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/favorites GET] error', err);
    return new Response(JSON.stringify({ slugs: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  try {
    await connect();
    const token = await getToken({ req: request, secret });
    if (!token || !token.sub) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = token.sub;
    const body = await request.json();
    const slug = body && body.slug ? String(body.slug) : null;
    if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    const fav = await Favorite.findOneAndUpdate({ userId }, { $addToSet: { slugs: slug } }, { upsert: true, new: true });
    return new Response(JSON.stringify({ slugs: fav.slugs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/favorites POST] error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connect();
    const token = await getToken({ req: request, secret });
    if (!token || !token.sub) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const userId = token.sub;
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    const fav = await Favorite.findOneAndUpdate({ userId }, { $pull: { slugs: slug } }, { new: true });
    return new Response(JSON.stringify({ slugs: (fav && fav.slugs) || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/favorites DELETE] error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
