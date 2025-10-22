"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from './SmartImage';
import FavoriteButton from './FavoriteButton';

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
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300 text-lg">Se încarcă produsele...</p>
        </div>
      )}

      {!loading && products && (
        <>
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="max-w-md mx-auto bg-slate-800/70 rounded-2xl p-8 border border-slate-700 shadow-lg">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2H5V5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Niciun produs găsit</h3>
                <p className="text-slate-300 mb-4">Nu există încă produse pentru această categorie.</p>
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Înapoi la prima pagină
                </Link>
              </div>
            </div>
          ) : (
            <div className="mobile-grid gap-6 sm:gap-8">
              {products.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group block">
                  <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-900/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700 hover:border-slate-600">
                    <div className="relative">
                      {/* Product image container */}
                      <div className="w-full h-52 sm:h-56 md:h-60 lg:h-64 relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                        <Image 
                          src={p.image || ''} 
                          alt={p.name} 
                          fill 
                          style={{ objectFit: 'cover' }} 
                          className="group-hover:scale-110 transition-transform duration-500" 
                        />
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      </div>
                      
                      {/* Top badges */}
                      <div className="absolute left-0 top-0 m-4 flex flex-col gap-2">
                        {p.displayPrice && (
                          <div className="bg-black/60 text-xs text-white px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium border border-white/10 shadow-lg flex items-center">
                            <svg className="w-4 h-4 mr-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {p.displayPrice}
                          </div>
                        )}
                      </div>
                      
                      {/* Favorite button */}
                      <div className="absolute right-0 top-0 m-4">
                        <div className="bg-black/50 rounded-full p-1.5 backdrop-blur-sm border border-white/10 shadow-lg">
                          <FavoriteButton productSlug={p.slug} size={28} />
                        </div>
                      </div>
                      
                      {/* Quick view button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-cyan-600/90 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Vezi Detalii
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content area */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>
                      
                      {/* CTA button */}
                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-cyan-400 font-semibold">
                            {p.displayPrice || 'Preț variabil'}
                          </div>
                          <div className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium group-hover:bg-cyan-600 transition-all duration-300 flex items-center">
                            Vezi Oferta
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
