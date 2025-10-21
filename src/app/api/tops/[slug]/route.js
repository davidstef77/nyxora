import connect from '../../lib/db';
import Top from '../../lib/models/Top';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

function cleanKey(value) {
  if (!value) return '';
  return value.replace(/^['"]+|['"]+$/g, '').trim();
}

async function isAuthorized(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === 'admin') return true;
  const envKey = cleanKey(process.env.ADMIN_KEY);
  if (envKey) {
    const headerKey = cleanKey(request.headers.get('x-admin-key'));
    return headerKey && headerKey === envKey;
  }

  return false;
}

export async function GET(request, { params }) {
  try {
    await connect();
  const { slug } = params;
  const authorized = await isAuthorized(request);
  const t = await Top.findOne(authorized ? { slug } : { slug, published: true }).lean();
    if (!t) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ top: t }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/tops/[slug]] GET error', err);
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
    const update = { ...body };
    delete update._id;
    delete update.createdAt;
    delete update.updatedAt;
    const updated = await Top.findOneAndUpdate({ slug }, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ top: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[api/tops/[slug]] PUT error', err);
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
    const res = await Top.findOneAndDelete({ slug }).lean();
    if (!res) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('[api/tops/[slug]] DELETE error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
