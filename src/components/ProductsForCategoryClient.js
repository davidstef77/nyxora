"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from './SmartImage';

export default function ProductsForCategoryClient({ categorySlug }) {
  const [show, setShow] = useState(false);
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
      if (process.env.NODE_ENV !== 'production') console.error('loadProducts error', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setShow(true);
    }
  }

  if (!show) {
    return (
      <div className="panel p-6">
        <p className="text-slate-300 mb-4">Vezi produsele din această categorie.</p>
        <button onClick={loadProducts} className="btn-primary">Arată Produse</button>
      </div>
    );
  }

  return (
    <div>
      {loading && <p className="text-slate-400">Se încarcă...</p>}
      {!loading && products && products.length === 0 && (
        <p className="text-slate-400">Nu există produse în această categorie.</p>
      )}
      {!loading && products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {products.map((p) => {
            const affiliateId = p.affiliateId || p.slug || (p._id && String(p._id));
            const productHref = `/r/${encodeURIComponent(affiliateId)}?t=${encodeURIComponent(p.slug)}&utm_source=pca&utm_medium=affiliate&utm_campaign=${encodeURIComponent(categorySlug)}`;
            return (
              <article key={p.slug || p._id} className="bg-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition block">
                <Link href={`/products/${p.slug}`} className="block">
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
                      <div className={`text-sm mt-1 ${p.inStock ? 'text-green-400' : 'text-rose-400'}`}>
                        {p.inStock ? 'În stoc' : 'Stoc epuizat'}
                      </div>
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
