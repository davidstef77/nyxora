import connect from '../lib/db';
import Top from '../lib/models/Top';
import { isAuthorized } from '../../../lib/auth';

export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const publishedParam = url.searchParams.get('published');
    const filter = {};
    const authorized = await isAuthorized(request);

    if (publishedParam === '1' || publishedParam === 'true' || !publishedParam) {
      filter.published = true;
    } else if (publishedParam === '0' || publishedParam === 'false') {
      if (!authorized) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      // authorized admin: no filter => return all
    } else {
      filter.published = true;
    }

    const tops = await Top.find(filter).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return new Response(JSON.stringify({ tops }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/tops] GET error', err);
    return new Response(JSON.stringify({ tops: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const body = await request.json();
    const top = await Top.create(body);
    return new Response(JSON.stringify(top), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/tops] POST error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
