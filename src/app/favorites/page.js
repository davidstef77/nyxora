"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from '../../components/SmartImage';
import FavoriteButton from '../../components/FavoriteButton';

function loadFavorites() {
  try {
    const raw = localStorage.getItem('favorites');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadFavorites error', e);
    return [];
  }
}

export default function FavoritesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && session;

  useEffect(() => {
    async function load() {
      setLoading(true);
      let favs = [];
      if (isAuthenticated) {
        try {
          const res = await fetch('/api/favorites');
          if (res.ok) {
            const json = await res.json();
            favs = Array.isArray(json.slugs) ? json.slugs : [];
          }
        } catch (err) {
          console.error('favorites fetch (server) error', err);
          favs = loadFavorites();
        }
      } else {
        favs = loadFavorites();
      }

      if (!favs || favs.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const q = new URLSearchParams();
        q.set('slugs', favs.join(','));
        const res = await fetch('/api/products?' + q.toString());
        const json = await res.json();
        setProducts(json.products || []);
      } catch (err) {
        console.error('favorites fetch error', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

  load();

    function onUpdate() { load(); }
    window.addEventListener('favorites-updated', onUpdate);
    return () => window.removeEventListener('favorites-updated', onUpdate);
  }, [isAuthenticated]);

  if (loading) return <main className="container px-6 py-16"> <p className="text-slate-400">Se încarcă...</p> </main>;

  return (
    <main className="container px-6 py-16">
      <h1 className="text-2xl font-semibold mb-6">Favorite</h1>
      {products.length === 0 ? (
        <p className="text-slate-400">Nu ai produse favorite încă.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="block bg-slate-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg">
              <div className="w-full h-40 relative">
                <Image src={p.image || ''} alt={p.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-100">{p.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{p.displayPrice || 'Preț nedefinit'}</p>
                </div>
                <div>
                  <FavoriteButton productSlug={p.slug} size={36} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
