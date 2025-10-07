import connect from '../api/lib/db';
import Product from '../api/lib/models/Product';
import Category from '../api/lib/models/Category';

export async function GET() {
  try {
    await connect();
    const products = await Product.find().select('slug updatedAt').lean();
    const categories = await Category.find().select('slug updatedAt').lean();
  // manufacturers intentionally excluded from sitemap
  const manufacturers = [];

    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const baseUrl = base.startsWith('http') ? base : `https://${base}`;

    const urls = [
      { loc: `${baseUrl}/`, priority: 1.0 },
      { loc: `${baseUrl}/products`, priority: 0.9 },
      { loc: `${baseUrl}/categories`, priority: 0.8 }
    ];

    products.forEach((p) => urls.push({ loc: `${baseUrl}/products/${p.slug}`, lastmod: p.updatedAt || undefined, priority: 0.7 }));
    categories.forEach((c) => urls.push({ loc: `${baseUrl}/categories/${c.slug}`, lastmod: c.updatedAt || undefined, priority: 0.6 }));
  // manufacturers URLs omitted

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(u => `
        <url>
          <loc>${u.loc}</loc>
          ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
          <priority>${u.priority}</priority>
        </url>
      `).join('')}
    </urlset>`;

    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (err) {
    console.error('[sitemap] error', err);
    return new Response('');
  }
}
