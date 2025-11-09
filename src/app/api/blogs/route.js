import connect from '../lib/db';
import Blog from '../lib/models/Blog';
import { isAuthorized } from '../../../lib/auth';

export async function GET(request) {
  try {
    await connect();
    const url = new URL(request.url);
    const publishedParam = url.searchParams.get('published');
    const filter = {};

    // by default, public requests should only receive published blogs
    // if published=1 or not provided => only published
    // if published=0 (explicit request for unpublished), require authorization
    const authorized = await isAuthorized(request);

    if (publishedParam === '1' || publishedParam === 'true' || !publishedParam) {
      filter.published = true;
    } else if (publishedParam === '0' || publishedParam === 'false') {
      if (!authorized) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      // authorized admin: no filter => return all
    } else {
      // any other value: be conservative
      filter.published = true;
    }

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
