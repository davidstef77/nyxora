const connect = require('../src/app/api/lib/db.js').default;
const Product = require('../src/app/api/lib/models/Product.js').default;
const Category = require('../src/app/api/lib/models/Category.js').default;

async function seed() {
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

    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();
