import { NextResponse } from 'next/server';
import connect from '../../api/lib/db';
import Product from '../../api/lib/models/Product';
import Click from '../../api/lib/models/Click';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    await connect();
    const product = await Product.findOne({ $or: [{ affiliateId: id }, { slug: id }, { _id: id }] }).lean();
    const referer = request.headers.get('referer') || null;
    const ua = request.headers.get('user-agent') || null;
    const ip = request.headers.get('x-forwarded-for') || null;

    let redirectTo = process.env.NEXT_PUBLIC_FALLBACK_AFFILIATE || '/';
    if (product && (product.affiliateUrl || product.url)) {
      redirectTo = product.affiliateUrl || product.url;
    }

    const url = new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const search = url.searchParams;
    if (!search.get('utm_source')) search.set('utm_source', 'pca');
    if (!search.get('utm_medium')) search.set('utm_medium', 'affiliate');
    if (!search.get('utm_campaign') && product && product.slug) search.set('utm_campaign', product.slug);
    const clickId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    search.set('utm_id', clickId);
    url.search = search.toString();

    try {
      await Click.create({
        affiliateId: id,
        productSlug: product?.slug || null,
        redirectUrl: redirectTo,
        referer,
        userAgent: ua,
        ip,
        clickId,
        createdAt: new Date()
      });
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Click log error', e);
    }

    return NextResponse.redirect(url.toString(), 307);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[affiliate redirect] error', err);
    return NextResponse.redirect('/', 307);
  }
}
