"use client";

import { useEffect, useState } from 'react';

function sanitizeKey(v) {
  if (!v) return '';
  let s = v.trim();
  // remove surrounding quotes if present
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function useApi(adminKey) {
  const headers = {};
  const clean = sanitizeKey(adminKey);
  if (clean) headers['x-admin-key'] = clean;

  async function fetchJSON(path, opts = {}) {
    const res = await fetch(path, { headers, ...opts });
    const text = await res.text();
    try {
      return JSON.parse(text || '{}');
    } catch (e) {
      return { error: text };
    }
  }

  return { fetchJSON };
}

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // load saved key from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminKey');
      if (saved) setAdminKey(saved);
    } catch (e) {
      // ignore (no localStorage)
    }
  }, []);

  // persist cleaned key
  useEffect(() => {
    try {
      if (adminKey) localStorage.setItem('adminKey', sanitizeKey(adminKey));
      else localStorage.removeItem('adminKey');
    } catch (e) {
      // ignore
    }
  }, [adminKey]);

  const api = useApi(adminKey);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchJSON('/api/data');
      setCategories(data.categories || []);
      setProducts(data.featuredProducts || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createCategory(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
      name: form.name.value,
      slug: form.slug.value,
      description: form.description.value || '',
      icon: form.icon.value || ''
    };
    const res = await api.fetchJSON('/api/categories', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) setError(res.error);
    else {
      form.reset();
      loadAll();
    }
  }

  async function deleteCategory(slug) {
    // categories delete endpoint expects adminKey as query param in current implementation
    const key = sanitizeKey(adminKey);
    const url = '/api/categories/' + encodeURIComponent(slug) + (key ? ('?adminKey=' + encodeURIComponent(key)) : '');
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  async function createProduct(e) {
    e.preventDefault();
    const form = e.target;
    let affiliateLinks = [];
    if (form.affiliateLinks.value) {
      try {
        affiliateLinks = JSON.parse(form.affiliateLinks.value);
      } catch (err) {
        setError('Invalid affiliateLinks JSON');
        return;
      }
    }
    const body = {
      name: form.name.value,
      slug: form.slug.value,
      description: form.description.value || '',
      price: parseFloat(form.price.value) || 0,
      images: form.images.value ? form.images.value.split(',').map(s => s.trim()) : [],
      category: form.category.value || null,
      affiliateLinks
    };
    const res = await api.fetchJSON('/api/products', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) setError(res.error);
    else {
      form.reset();
      loadAll();
    }
  }

  async function deleteProduct(slug) {
    const key = sanitizeKey(adminKey);
    const res = await fetch('/api/products/' + encodeURIComponent(slug), { method: 'DELETE', headers: { 'x-admin-key': key } });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Admin Panel</h1>
      <p>Enter your admin key to authorize create/update/delete actions (sent as x-admin-key header). Surrounding quotes will be removed automatically.</p>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Admin Key" value={adminKey} onChange={e => setAdminKey(e.target.value)} style={{ padding: 8, width: 360 }} />
        <button onClick={loadAll} style={{ marginLeft: 8, padding: '8px 12px' }}>Refresh</button>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <section style={{ marginTop: 20 }}>
        <h2>Categories</h2>
        <ul>
          {categories.map(c => (
            <li key={c._id} style={{ marginBottom: 6 }}>
              <strong>{c.name}</strong> — {c.slug}
              <button onClick={() => deleteCategory(c.slug)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>

        <form onSubmit={createCategory} style={{ marginTop: 12 }}>
          <h3>Create Category</h3>
          <input name="name" placeholder="Name" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="icon" placeholder="icon url or name" style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6 }} />
          <button type="submit">Create</button>
        </form>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Products</h2>
        <ul>
          {products.map(p => (
            <li key={p._id} style={{ marginBottom: 6 }}>
              <strong>{p.name}</strong> — {p.slug} — ${p.price}
              <button onClick={() => deleteProduct(p.slug)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>

        <form onSubmit={createProduct} style={{ marginTop: 12 }}>
          <h3>Create Product</h3>
          <input name="name" placeholder="Name" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="price" placeholder="price" style={{ display: 'block', marginBottom: 6 }} />
          <input name="images" placeholder="images (comma separated URLs)" style={{ display: 'block', marginBottom: 6 }} />
          <input name="category" placeholder="category slug" style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="affiliateLinks" placeholder='affiliateLinks (JSON array, e.g. [{"storeName":"Amazon","url":"https://...","price":19.99}])' style={{ display: 'block', marginBottom: 6 }} />
          <button type="submit">Create Product</button>
        </form>
      </section>
    </div>
  );
}
