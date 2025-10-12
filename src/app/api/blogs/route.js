import connect from '../lib/db';
import Blog from '../lib/models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

function cleanKey(value) {
  if (!value) return '';
  return value.replace(/^['"]+|['"]+$/g, '').trim();
}

async function isAuthorized(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === 'admin') return true;

  const envKey = cleanKey(process.env.ADMIN_KEY);
  if (!envKey) return true;
  const headerKey = cleanKey(request.headers.get('x-admin-key'));
  return headerKey && headerKey === envKey;
}

export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const onlyPublished = url.searchParams.get('published');
    const filter = {};
    if (onlyPublished === '1' || onlyPublished === 'true') filter.published = true;
    const blogs = await Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return new Response(JSON.stringify({ blogs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/blogs] GET error', err);
    return new Response(JSON.stringify({ blogs: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();
    const body = await request.json();
    const blog = await Blog.create(body);
    return new Response(JSON.stringify(blog), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/blogs] POST error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
