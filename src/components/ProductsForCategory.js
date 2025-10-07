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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {products.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Nu există produse pentru această categorie.</p>}
          {products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-white/10">
                <div className="w-full h-64 sm:h-72 relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  <Image 
                    src={p.image || ''} 
                    alt={p.name} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    className="group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {p.displayPrice && (
                    <div className="absolute bottom-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white font-semibold px-3 py-2 rounded-full text-sm shadow-lg">
                      {p.displayPrice}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-100 text-lg mb-2 line-clamp-2 leading-relaxed group-hover:text-cyan-400 transition-colors">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
