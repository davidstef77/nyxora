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
  const [editingCategory, setEditingCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickAffiliateLinks, setQuickAffiliateLinks] = useState([]);
  const [quickBenchmarks, setQuickBenchmarks] = useState([]);

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

  async function saveCategoryEdit(e) {
    e.preventDefault();
    const form = e.target;
    if (!adminKey) { setError('Admin key required to edit categories'); return; }
    const body = {
      name: form.name.value,
      slug: form.slug.value,
      description: form.description.value || '',
      icon: form.icon.value || ''
    };
    const target = editingCategory && editingCategory.originalSlug ? editingCategory.originalSlug : (editingCategory && editingCategory.slug);
    const res = await api.fetchJSON('/api/categories/' + encodeURIComponent(target), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.error) setError('Update failed: ' + res.error); else { setEditingCategory(null); loadAll(); }
  }

  async function createProduct(e) {
    e.preventDefault();
    const form = e.target;
    const affiliateLinks = Array.isArray(quickAffiliateLinks) ? quickAffiliateLinks : [];
    const body = {
      name: form.name.value,
      slug: form.slug.value,
      description: form.description.value || '',
      images: form.images && form.images.value ? form.images.value.split(',').map(s => s.trim()) : [],
      category: form.category.value || null,
  affiliateLinks,
  benchmarks: Array.isArray(quickBenchmarks) ? quickBenchmarks : [],
      // manufacturer fields removed
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
              {editingCategory && editingCategory._id === c._id ? (
                <form onSubmit={saveCategoryEdit} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <input name="name" defaultValue={c.name} style={{ padding: 6 }} />
                  <input name="slug" defaultValue={c.slug} style={{ padding: 6 }} />
                  <input name="icon" defaultValue={c.icon || ''} style={{ padding: 6 }} />
                  <input name="description" defaultValue={c.description || ''} style={{ padding: 6 }} />
                  <button type="submit" style={{ marginLeft: 8 }}>Save</button>
                  <button type="button" onClick={() => setEditingCategory(null)} style={{ marginLeft: 6 }}>Cancel</button>
                </form>
              ) : (
                <>
                  <strong>{c.name}</strong> — {c.slug}
                  <button onClick={() => setEditingCategory({ ...c, originalSlug: c.slug })} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteCategory(c.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </>
              )}
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
              <strong>{p.name}</strong> — {p.slug} — {p.displayPrice || 'Preț nedefinit'}
              <button onClick={() => deleteProduct(p.slug)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>

          <form onSubmit={createProduct} style={{ marginTop: 12 }}>
          <h3>Create Product</h3>
          <input name="name" placeholder="Name" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6 }} />
            {/* manufacturer fields removed */}
          <input name="images" placeholder="images (comma separated URLs)" style={{ display: 'block', marginBottom: 6 }} />
          <input name="category" placeholder="category slug" style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6 }} />
          <div style={{ marginBottom: 6 }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: 6 }}>Affiliate Links</label>
            {quickAffiliateLinks.map((l, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input value={l.storeName || ''} onChange={ev => { const copy = [...quickAffiliateLinks]; copy[idx] = { ...copy[idx], storeName: ev.target.value }; setQuickAffiliateLinks(copy); }} placeholder="storeName" />
                <input value={l.url || ''} onChange={ev => { const copy = [...quickAffiliateLinks]; copy[idx] = { ...copy[idx], url: ev.target.value }; setQuickAffiliateLinks(copy); }} placeholder="url" />
                <input value={l.price || ''} onChange={ev => { const copy = [...quickAffiliateLinks]; copy[idx] = { ...copy[idx], price: ev.target.value }; setQuickAffiliateLinks(copy); }} placeholder="price" style={{ width: 120 }} />
                <button type="button" onClick={() => setQuickAffiliateLinks(quickAffiliateLinks.filter((_,i)=>i!==idx))}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setQuickAffiliateLinks([...quickAffiliateLinks, { storeName: '', url: '', price: '' }])}>Add link</button>
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: 6 }}>Benchmarks</label>
            {quickBenchmarks.map((b, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <input value={b.title || ''} onChange={ev => { const copy = [...quickBenchmarks]; copy[idx] = { ...copy[idx], title: ev.target.value }; setQuickBenchmarks(copy); }} placeholder="title" style={{ display: 'block', marginBottom: 6 }} />
                <input value={b.image || ''} onChange={ev => { const copy = [...quickBenchmarks]; copy[idx] = { ...copy[idx], image: ev.target.value }; setQuickBenchmarks(copy); }} placeholder="image url" style={{ display: 'block', marginBottom: 6 }} />
                <textarea value={b.text || ''} onChange={ev => { const copy = [...quickBenchmarks]; copy[idx] = { ...copy[idx], text: ev.target.value }; setQuickBenchmarks(copy); }} placeholder="text" style={{ display: 'block', marginBottom: 6 }} />
                <button type="button" onClick={() => setQuickBenchmarks(quickBenchmarks.filter((_,i)=>i!==idx))}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setQuickBenchmarks([...quickBenchmarks, { title: '', text: '', image: '' }])}>Add benchmark</button>
          </div>
          <button type="submit">Create Product</button>
        </form>
      </section>
    </div>
  );
}
