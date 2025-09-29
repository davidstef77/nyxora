"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from './SmartImage';

export default function ProductsForCategory({ categorySlug }) {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(categorySlug)}`);
        const json = await res.json();
        if (!mounted) return;
        setProducts(json.products || []);
      } catch (err) {
        console.error('loadProducts error', err);
        if (!mounted) return;
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { mounted = false };
  }, [categorySlug]);

  return (
    <div>
      {loading && <p className="text-slate-400">Se încarcă produsele...</p>}

      {!loading && products && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
              <div className="w-full h-40 relative">
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-slate-100">{p.name}</h3>
                <p className="text-sm text-slate-300 mt-1">{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
