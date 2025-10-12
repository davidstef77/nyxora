"use client";

import { useEffect, useState } from 'react';
import RichTextEditor from './RichTextEditor';

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
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [tops, setTops] = useState([]);
  const [editingTop, setEditingTop] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [editingTopItems, setEditingTopItems] = useState([]);
  const [blogContentDraft, setBlogContentDraft] = useState('');
  const [editingBlogContent, setEditingBlogContent] = useState('');
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
      // load blogs and tops separately (public lists)
      try {
        const b = await api.fetchJSON('/api/blogs?published=0');
        setBlogs(Array.isArray(b.blogs) ? b.blogs : []);
      } catch (e) {
        setBlogs([]);
      }
      try {
        const t = await api.fetchJSON('/api/tops?published=0');
        setTops(Array.isArray(t.tops) ? t.tops : []);
      } catch (e) {
        setTops([]);
      }
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

  // --- Blogs ---
  async function createBlog(e) {
    e.preventDefault();
    if (!adminKey) { setError('Admin key required to create blogs'); return; }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const excerpt = (fd.get('excerpt') || '').toString();
    const image = (fd.get('image') || '').toString();
    const author = (fd.get('author') || '').toString();
    const tagsRaw = (fd.get('tags') || '').toString();
    const published = fd.get('published') !== null;
    const body = {
      title,
      slug,
      excerpt,
      content: blogContentDraft || '',
      image,
      author,
      tags: tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
      published
    };
    if (body.published) {
      body.publishedAt = new Date().toISOString();
    } else {
      body.publishedAt = null;
    }
    const res = await api.fetchJSON('/api/blogs', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) setError(res.error);
    else { form.reset(); setBlogContentDraft(''); loadAll(); }
  }


  async function deleteBlog(slug) {
    const key = sanitizeKey(adminKey);
    const res = await fetch('/api/blogs/' + encodeURIComponent(slug), { method: 'DELETE', headers: { 'x-admin-key': key } });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  async function saveBlogEdit(e) {
    e.preventDefault();
    if (!adminKey) { setError('Admin key required to edit blogs'); return; }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const excerpt = (fd.get('excerpt') || '').toString();
    const image = (fd.get('image') || '').toString();
    const author = (fd.get('author') || '').toString();
    const tagsRaw = (fd.get('tags') || '').toString();
    const published = fd.get('published') !== null;
    const body = {
      title,
      slug,
      excerpt,
      content: editingBlogContent || '',
      image,
      author,
      tags: tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
      published
    };
    if (body.published) {
      body.publishedAt = editingBlog?.publishedAt || new Date().toISOString();
    } else {
      body.publishedAt = null;
    }
    const target = editingBlog && (editingBlog.originalSlug || editingBlog.slug);
    const res = await api.fetchJSON('/api/blogs/' + encodeURIComponent(target), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.error) setError('Update failed: ' + res.error); else { setEditingBlog(null); setEditingBlogContent(''); loadAll(); }
  }

  // --- Tops ---
  async function createTop(e) {
    e.preventDefault();
    if (!adminKey) { setError('Admin key required to create tops'); return; }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const description = (fd.get('description') || '').toString();
    const published = fd.get('published') !== null;
    // items come from topItems state
    const items = Array.isArray(topItems) ? topItems : [];
    const body = { title, slug, description, items, published };
    const res = await api.fetchJSON('/api/tops', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) setError(res.error);
    else { form.reset(); setTopItems([]); loadAll(); }
  }

  async function deleteTop(slug) {
    const key = sanitizeKey(adminKey);
    const res = await fetch('/api/tops/' + encodeURIComponent(slug), { method: 'DELETE', headers: { 'x-admin-key': key } });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  async function saveTopEdit(e) {
    e.preventDefault();
    if (!adminKey) { setError('Admin key required to edit tops'); return; }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const description = (fd.get('description') || '').toString();
    const published = fd.get('published') !== null;
    const items = Array.isArray(editingTopItems) ? editingTopItems : [];
    const body = { title, slug, description, items, published };
    const target = editingTop && (editingTop.originalSlug || editingTop.slug);
    const res = await api.fetchJSON('/api/tops/' + encodeURIComponent(target), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.error) setError('Update failed: ' + res.error); else { setEditingTop(null); setEditingTopItems([]); loadAll(); }
  }

  // Helpers for managing top items in the UI
  function addTopItem() {
    setTopItems([...topItems, { title: '', description: '', productRef: '', rank: (topItems.length + 1) }]);
  }
  function updateTopItem(idx, patch) {
    const copy = [...topItems]; copy[idx] = { ...copy[idx], ...patch }; setTopItems(copy);
  }
  function removeTopItem(idx) {
    const copy = [...topItems]; copy.splice(idx, 1); setTopItems(copy);
  }

  function addEditingTopItem() {
    setEditingTopItems([...editingTopItems, { title: '', description: '', productRef: '', rank: (editingTopItems.length + 1) }]);
  }
  function updateEditingTopItem(idx, patch) {
    const copy = [...editingTopItems]; copy[idx] = { ...copy[idx], ...patch }; setEditingTopItems(copy);
  }
  function removeEditingTopItem(idx) {
    const copy = [...editingTopItems]; copy.splice(idx, 1); setEditingTopItems(copy);
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

      <section style={{ marginTop: 28 }}>
        <h2>Blogs</h2>
        <ul>
          {blogs.map(b => (
            <li key={b._id} style={{ marginBottom: 6 }}>
              {editingBlog && editingBlog._id === b._id ? (
                <form onSubmit={saveBlogEdit} style={{ display: 'grid', gap: 8, background: 'rgba(15,23,42,0.35)', padding: 16, borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }}>
                  <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <input name="title" defaultValue={b.title} placeholder="Title" style={{ padding: 10, borderRadius: 8 }} />
                    <input name="slug" defaultValue={b.slug} placeholder="slug" style={{ padding: 10, borderRadius: 8 }} />
                    <input name="author" defaultValue={b.author || ''} placeholder="author" style={{ padding: 10, borderRadius: 8 }} />
                    <input name="image" defaultValue={b.image || ''} placeholder="image url" style={{ padding: 10, borderRadius: 8 }} />
                    <input name="tags" defaultValue={(b.tags || []).join(',')} placeholder="tag1, tag2" style={{ padding: 10, borderRadius: 8 }} />
                  </div>
                  <textarea name="excerpt" defaultValue={b.excerpt || ''} placeholder="Scurt rezumat (excerpt)" style={{ padding: 10, borderRadius: 8, minHeight: 80 }} />
                  <RichTextEditor value={editingBlogContent} onChange={setEditingBlogContent} products={products} placeholder="Conținutul articolului" />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input name="published" type="checkbox" defaultChecked={b.published} />
                    Publicat
                  </label>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="submit">Salvează</button>
                    <button type="button" onClick={() => { setEditingBlog(null); setEditingBlogContent(''); }}>Anulează</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{b.title}</strong> — {b.slug}
                  <button onClick={() => { setEditingBlog({ ...b, originalSlug: b.slug }); setEditingBlogContent(b.content || ''); }} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteBlog(b.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createBlog} style={{ marginTop: 12 }}>
          <h3>Create Blog</h3>
          <input name="title" placeholder="Title" required style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="author" placeholder="author" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="image" placeholder="image url" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="tags" placeholder="tags (comma separated)" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <textarea name="excerpt" placeholder="Scurt rezumat (excerpt)" style={{ display: 'block', marginBottom: 12, padding: 10, borderRadius: 8 }} />
          <RichTextEditor value={blogContentDraft} onChange={setBlogContentDraft} products={products} placeholder="Conținutul articolului" />
          <label style={{ display: 'block', margin: '12px 0' }}><input type="checkbox" name="published" /> Publică imediat</label>
          <button type="submit">Create Blog</button>
        </form>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Tops</h2>
        <ul>
          {tops.map(t => (
            <li key={t._id} style={{ marginBottom: 6 }}>
              {editingTop && editingTop._id === t._id ? (
                <form onSubmit={saveTopEdit} style={{ display: 'block', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input name="title" defaultValue={t.title} style={{ padding: 6 }} />
                    <input name="slug" defaultValue={t.slug} style={{ padding: 6 }} />
                    <input name="description" defaultValue={t.description || ''} style={{ padding: 6 }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input name="published" type="checkbox" defaultChecked={t.published} />Published</label>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <h4>Items</h4>
                    {editingTopItems.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <input value={it.title || ''} onChange={ev => updateEditingTopItem(idx, { title: ev.target.value })} placeholder="Title" />
                        <input value={it.description || ''} onChange={ev => updateEditingTopItem(idx, { description: ev.target.value })} placeholder="Description" />
                        <select value={it.productRef || ''} onChange={ev => updateEditingTopItem(idx, { productRef: ev.target.value })}>
                          <option value="">(no product)</option>
                          {products.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
                        </select>
                        <input type="number" value={it.rank || ''} onChange={ev => updateEditingTopItem(idx, { rank: Number(ev.target.value) })} style={{ width: 80 }} />
                        <button type="button" onClick={() => removeEditingTopItem(idx)}>Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={addEditingTopItem}>Add item</button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" style={{ marginRight: 8 }}>Save</button>
                    <button type="button" onClick={() => { setEditingTop(null); setEditingTopItems([]); }} style={{ marginLeft: 6 }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{t.title}</strong> — {t.slug}
                  <button onClick={() => { setEditingTop({ ...t, originalSlug: t.slug }); setEditingTopItems(t.items || []); }} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteTop(t.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createTop} style={{ marginTop: 12 }}>
          <h3>Create Top</h3>
          <input name="title" placeholder="Title" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6 }} />
          <div>
            <h4>Items</h4>
            {topItems.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input value={it.title || ''} onChange={ev => updateTopItem(idx, { title: ev.target.value })} placeholder="Title" />
                <input value={it.description || ''} onChange={ev => updateTopItem(idx, { description: ev.target.value })} placeholder="Description" />
                <select value={it.productRef || ''} onChange={ev => updateTopItem(idx, { productRef: ev.target.value })}>
                  <option value="">(no product)</option>
                  {products.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
                </select>
                <input type="number" value={it.rank || ''} onChange={ev => updateTopItem(idx, { rank: Number(ev.target.value) })} style={{ width: 80 }} />
                <button type="button" onClick={() => removeTopItem(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addTopItem}>Add item</button>
          </div>
          <label style={{ display: 'block', marginBottom: 6 }}><input type="checkbox" name="published" /> Publish immediately</label>
          <button type="submit">Create Top</button>
        </form>
      </section>
    </div>
  );
}
