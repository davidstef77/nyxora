import connect from '../lib/db';
import Product from '../lib/models/Product';
import Category from '../lib/models/Category';

function sanitizeKey(v) {
  if (!v) return '';
  let s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export async function POST(request) {
  const adminKey = sanitizeKey(request.headers.get('x-admin-key'));
  const envKey = sanitizeKey(process.env.ADMIN_KEY);
  if (envKey && envKey !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connect();

    const categories = [
      { name: 'Procesoare de Ultimă Generație', slug: 'procesoare', description: 'Procesoare high-end pentru gaming și productivitate maximă', icon: '/file.svg' },
      { name: 'Plăci Video Premium', slug: 'placi-video', description: 'GPU-uri puternice pentru gaming la rezoluție 4K', icon: '/globe.svg' },
      { name: 'Sisteme de Răcire', slug: 'racire', description: 'Soluții de răcire pentru performanță optimă', icon: '/window.svg' }
    ];

    for (const c of categories) {
      await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
    }

    const products = [
      {
        name: 'AMD Ryzen 9 7950X',
        slug: 'amd-ryzen-9-7950x',
        price: '3.299 RON',
        image: '/next.svg',
        description: 'Procesor high-end AMD',
        category: 'procesoare',
        affiliateLinks: [
          { storeName: 'eMag', url: 'https://emag.example/amd-ryzen-9-7950x', price: '3.299 RON' }
        ]
      },
      {
        name: 'NVIDIA RTX 4080',
        slug: 'nvidia-rtx-4080',
        price: '6.499 RON',
        image: '/next.svg',
        description: 'Placă video premium',
        category: 'placi-video',
        affiliateLinks: [
          { storeName: 'PCGarage', url: 'https://pcgarage.example/rtx-4080', price: '6.499 RON' }
        ]
      }
    ];

    for (const p of products) {
      await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const body = { error: msg };
    if (process.env.NODE_ENV !== 'production' && err && err.stack) body.stack = err.stack;
    return new Response(JSON.stringify(body), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
