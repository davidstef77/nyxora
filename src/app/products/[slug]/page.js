import Image from '../../../components/SmartImage';
import Link from 'next/link';
import connect from '../../api/lib/db';
import Product from '../../api/lib/models/Product';

async function getData() {
  try {
    await connect();
    const featuredProducts = await Product.find().sort({ createdAt: -1 }).limit(100).lean();
    return { featuredProducts };
  } catch (err) {
    console.error('[product page] getData error', err);
    return { featuredProducts: [] };
  }
}

export default async function ProductPage({ params }) {
  try {
    const { featuredProducts } = await getData();
    const product = featuredProducts.find((p) => p.slug === params.slug);

    if (!product) {
      return (
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-semibold">Produs negăsit</h1>
          <Link href="/" className="text-cyan-400 mt-4 block">Înapoi la listă</Link>
        </div>
      );
    }

    return (
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="w-full h-64 relative bg-slate-800/50 rounded-lg overflow-hidden">
              <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-slate-300 mb-6">Preț: {product.price}</p>
            <p className="mb-6">Descriere: {product.description || 'Componentă exemplar pentru exemplificare.'}</p>
            <div className="flex gap-4">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">Cumpără</button>
              <Link href="/" className="text-slate-300 hover:text-white">Înapoi</Link>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-semibold">Eroare la încărcare</h1>
        <p className="text-slate-300">{String(err)}</p>
      </div>
    );
  }
}
