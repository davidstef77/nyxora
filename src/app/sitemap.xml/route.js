import connect from '../api/lib/db';
import Product from '../api/lib/models/Product';
import Category from '../api/lib/models/Category';
import Blog from '../api/lib/models/Blog';
import Top from '../api/lib/models/Top';

export async function GET(request) {
  try {
    await connect();
    const products = await Product.find().select('slug updatedAt').lean();
    const categories = await Category.find().select('slug updatedAt').lean();
    const blogs = await Blog.find({ published: true }).select('slug updatedAt publishedAt').lean();
    const tops = await Top.find({ published: true }).select('slug updatedAt publishedAt').lean();

  // Prefer an explicit public base URL, otherwise use the request origin so
  // the sitemap reflects the hostname the client used (helps Search Console),
  // then fallback to VERCEL_URL and finally a hardcoded default.
  const requestOrigin = request ? new URL(request.url).origin : null;
  const base = process.env.NEXT_PUBLIC_BASE_URL || requestOrigin ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
          'https://nyxora.ro';
  const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;

    const urls = [
      { 
        loc: `${baseUrl}/`, 
        priority: 1.0, 
        changefreq: 'daily',
        lastmod: new Date().toISOString()
      },
      { 
        loc: `${baseUrl}/products`, 
        priority: 0.9, 
        changefreq: 'daily',
        lastmod: new Date().toISOString()
      },
      { 
        loc: `${baseUrl}/blog`, 
        priority: 0.8, 
        changefreq: 'weekly',
        lastmod: new Date().toISOString()
      },
      { 
        loc: `${baseUrl}/tops`, 
        priority: 0.7, 
        changefreq: 'weekly',
        lastmod: new Date().toISOString()
      }
    ];

    products.forEach((p) => urls.push({ 
      loc: `${baseUrl}/products/${p.slug}`, 
      lastmod: (p.updatedAt || new Date()).toISOString(), 
      priority: 0.8,
      changefreq: 'weekly'
    }));
    
    categories.forEach((c) => urls.push({ 
      loc: `${baseUrl}/categories/${c.slug}`, 
      lastmod: (c.updatedAt || new Date()).toISOString(), 
      priority: 0.7,
      changefreq: 'weekly'
    }));
    
    blogs.forEach((b) => urls.push({ 
      loc: `${baseUrl}/blog/${b.slug}`, 
      lastmod: (b.updatedAt || b.publishedAt || new Date()).toISOString(), 
      priority: 0.6,
      changefreq: 'monthly'
    }));
    
    tops.forEach((t) => urls.push({ 
      loc: `${baseUrl}/tops/${t.slug}`, 
      lastmod: (t.updatedAt || t.publishedAt || new Date()).toISOString(), 
      priority: 0.7,
      changefreq: 'weekly'
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, { 
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      } 
    });
  } catch (err) {
    console.error('[sitemap] error', err);
    return new Response('');
  }
}
