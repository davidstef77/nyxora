"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from './SmartImage';

// Browser-safe dev flag
const DEV = typeof window !== 'undefined' && (() => {
  try { return window.localStorage && window.localStorage.getItem('debug') === '1'; } catch { return false; }
})();

export default function ProductsForCategoryClient({ categorySlug }) {
  // load products immediately when component mounts
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(categorySlug)}`);
      if (!res.ok) throw new Error('Fetch error');
      const json = await res.json();
      setProducts(json.products || []);
    } catch (err) {
      // keep console.error for debugging server-side; client errors are OK to surface in dev
      if (DEV) console.error('loadProducts error', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // automatically load products for the category
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  return (
    <div>
      {loading && <p className="text-slate-400">Se încarcă...</p>}
      {!loading && products && products.length === 0 && (
        <p className="text-slate-400">Nu există produse în această categorie.</p>
      )}
      {!loading && products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {products.map((p) => {
            // Use internal product page links (no /r/ affiliate redirects here)
            const productHref = `/products/${encodeURIComponent(p.slug)}`;
            return (
              <article key={p.slug || p._id} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
                <Link href={productHref} className="block">
                  <div className="w-full h-40 relative">
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-medium text-slate-100">{p.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{p.shortDescription || ''}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{p.displayPrice || p.price || 'Contactează vânzător'}</div>
                      {/* Always show as in-stock to avoid exposing out-of-stock state */}
                      <div className={`text-sm mt-1 text-green-400`}>În stoc</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link href={productHref} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-semibold">
                        Vezi ofertă
                      </Link>
                      <Link href={`/products/${p.slug}`} className="text-xs text-slate-300 hover:text-slate-100">
                        Detalii
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span className="px-2 py-0.5 bg-black/30 rounded">Garantat</span>
                    {p.rating && <span>★ {Number(p.rating).toFixed(1)}</span>}
                    {p.reviewsCount ? <span>· {p.reviewsCount} recenzii</span> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
