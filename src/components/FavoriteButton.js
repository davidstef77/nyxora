"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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

function saveFavorites(list) {
  try {
    localStorage.setItem('favorites', JSON.stringify(list));
    // notify others
    window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { list } }));
  } catch (e) {
    console.error('saveFavorites error', e);
  }
}

export default function FavoriteButton({ productSlug, size = 40 }) {
  const [isFav, setIsFav] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && session;

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (isAuthenticated) {
        try {
          const res = await fetch('/api/favorites');
          if (!mounted) return;
          if (res.ok) {
            const json = await res.json();
            setIsFav(Array.isArray(json.slugs) && json.slugs.includes(productSlug));
          } else {
            // fallback to localStorage if server refused
            const favs = loadFavorites();
            setIsFav(Array.isArray(favs) && favs.includes(productSlug));
          }
        } catch (err) {
          const favs = loadFavorites();
          setIsFav(Array.isArray(favs) && favs.includes(productSlug));
        }
      } else {
        const favs = loadFavorites();
        setIsFav(Array.isArray(favs) && favs.includes(productSlug));
      }
    }

    init();

    function onUpdate() {
      const fresh = loadFavorites();
      setIsFav(Array.isArray(fresh) && fresh.includes(productSlug));
    }

    window.addEventListener('favorites-updated', onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('favorites-updated', onUpdate);
    };
  }, [productSlug, isAuthenticated]);

  function toggle(e) {
    e?.preventDefault();
    e?.stopPropagation();
    // If authenticated, call server API; otherwise use localStorage.
    if (isAuthenticated) {
      (async () => {
        try {
          // decide to add or remove based on current state
          if (isFav) {
            const res = await fetch(`/api/favorites?slug=${encodeURIComponent(productSlug)}`, { method: 'DELETE' });
            if (res.ok) {
              const json = await res.json();
              setIsFav(Array.isArray(json.slugs) && json.slugs.includes(productSlug));
              // sync local for UI immediate update
              saveFavorites(json.slugs || []);
            }
          } else {
            const res = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: productSlug }) });
            if (res.ok) {
              const json = await res.json();
              setIsFav(Array.isArray(json.slugs) && json.slugs.includes(productSlug));
              saveFavorites(json.slugs || []);
            }
          }
        } catch (err) {
          console.error('Favorites API error', err);
        }
      })();
    } else {
      const favs = loadFavorites();
      let next;
      if (Array.isArray(favs) && favs.includes(productSlug)) {
        next = favs.filter((s) => s !== productSlug);
      } else {
        next = Array.isArray(favs) ? [...favs, productSlug] : [productSlug];
      }
      saveFavorites(next);
      setIsFav(next.includes(productSlug));
    }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={isFav}
      aria-label={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
      className="inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {isFav ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
        </svg>
      )}
    </button>
  );
}
