"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import RichTextEditor from './RichTextEditor';

// Safe dev flag for browser-only without referencing process
const DEV = typeof window !== 'undefined' && (() => {
  try {
    // enable by setting localStorage.debug = '1'
    return window.localStorage && window.localStorage.getItem('debug') === '1';
  } catch {
    return false;
  }
})();

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
  const baseHeaders = {};
  const clean = sanitizeKey(adminKey);
  if (clean) baseHeaders['x-admin-key'] = clean;

  async function fetchJSON(path, opts = {}) {
    try {
      // Merge caller headers with baseHeaders without losing x-admin-key
      const callerHeaders = opts.headers || {};
      const mergedHeaders = { ...baseHeaders, ...callerHeaders };
      // If a JSON string body is provided and no explicit Content-Type, add it
      if (opts.body && typeof opts.body === 'string' && !Object.keys(mergedHeaders).some(h => h.toLowerCase() === 'content-type')) {
        mergedHeaders['Content-Type'] = 'application/json';
      }
      const fetchOptions = { ...opts, headers: mergedHeaders };
      const res = await fetch(path, fetchOptions);
      const text = await res.text();
      
      if (!res.ok) {
        return { error: `HTTP ${res.status}: ${text || res.statusText}` };
      }
      
      try {
        return JSON.parse(text || '{}');
      } catch (parseError) {
        return { error: `Invalid JSON response: ${text.substring(0, 100)}...` };
      }
    } catch (fetchError) {
      return { error: `Network error: ${fetchError.message}` };
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
  const [blogProductSlugs, setBlogProductSlugs] = useState([]);
  const [editingBlogProductSlugs, setEditingBlogProductSlugs] = useState([]);

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

  function addBlogProductSlug(slug, { editing = false } = {}) {
    if (DEV) console.log('addBlogProductSlug called with:', slug, 'editing:', editing);
    if (!slug) return;
    const setFn = editing ? setEditingBlogProductSlugs : setBlogProductSlugs;
    setFn((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      if (DEV) console.log('Current slugs:', prev, 'adding:', slug);
      if (next.includes(slug)) {
        if (DEV) console.log('Slug already exists, not adding');
        return next;
      }
      next.push(slug);
      if (DEV) console.log('New slugs:', next);
      return next;
    });
  }

  function removeBlogProductSlug(index, { editing = false } = {}) {
    const setFn = editing ? setEditingBlogProductSlugs : setBlogProductSlugs;
    setFn((prev) => {
      if (!Array.isArray(prev)) return [];
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }

  function moveBlogProductSlug(index, delta, { editing = false } = {}) {
    const setFn = editing ? setEditingBlogProductSlugs : setBlogProductSlugs;
    setFn((prev) => {
      if (!Array.isArray(prev) || prev.length < 2) return Array.isArray(prev) ? prev : [];
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return next;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  const handleAttachBlogProductDraft = (product) => {
    if (DEV) console.log('handleAttachBlogProductDraft called with:', product);
    if (!product?.slug) {
      if (DEV) console.log('No product slug, returning');
      return;
    }
    if (DEV) console.log('Adding product slug to draft:', product.slug);
    addBlogProductSlug(product.slug);
  };

  const handleAttachBlogProductEdit = (product) => {
    if (DEV) console.log('handleAttachBlogProductEdit called with:', product);
    if (!product?.slug) {
      if (DEV) console.log('No product slug, returning');
      return;
    }
    if (DEV) console.log('Adding product slug to edit:', product.slug);
    addBlogProductSlug(product.slug, { editing: true });
  };

  const renderBlogProductList = (slugs, { editing = false } = {}) => {
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return <p style={{ marginTop: 8, color: '#94a3b8', fontSize: 13 }}>Nu ai adăugat produse pentru acest articol.</p>;
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'grid', gap: 8 }}>
        {slugs.map((slug, idx) => {
          const product = products.find((p) => p.slug === slug);
          const label = product?.name || product?.title || slug;
          return (
            <li
              key={`${slug}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: 'rgba(15,23,42,0.4)',
                border: '1px solid rgba(148,163,184,0.25)',
                padding: '10px 12px',
                borderRadius: 10
              }}
            >
              <div style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{`/products/${slug}`}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => moveBlogProductSlug(idx, -1, { editing })}
                  disabled={idx === 0}
                  style={{ padding: '4px 8px' }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlogProductSlug(idx, 1, { editing })}
                  disabled={idx === slugs.length - 1}
                  style={{ padding: '4px 8px' }}
                >
                  ↓
                </button>
                <a
                  href={`/products/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.25)', color: '#bfdbfe', textDecoration: 'none', fontSize: 13 }}
                >
                  Deschide
                </a>
                <button
                  type="button"
                  onClick={() => removeBlogProductSlug(idx, { editing })}
                  style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.2)', color: '#fecaca', borderRadius: 6 }}
                >
                  Șterge
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchJSON('/api/data');
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      
      // If /api/data doesn't return featuredProducts, fall back to full products list
      let productsList = Array.isArray(data.featuredProducts) && data.featuredProducts.length ? data.featuredProducts : [];
      if (!productsList.length) {
        try {
          const p = await api.fetchJSON('/api/products');
          if (p.error) {
            console.warn('Products API error:', p.error);
            productsList = [];
          } else {
            productsList = Array.isArray(p.products) ? p.products : [];
          }
        } catch (err) {
          console.warn('Failed to load products:', err);
          productsList = [];
        }
      }
      setProducts(productsList);
      
      // load blogs and tops separately (public lists)
      try {
        const b = await api.fetchJSON('/api/blogs?published=0');
        if (b.error) {
          console.warn('Blogs API error:', b.error);
          setBlogs([]);
        } else {
          setBlogs(Array.isArray(b.blogs) ? b.blogs : []);
        }
      } catch (e) {
        console.warn('Failed to load blogs:', e);
        setBlogs([]);
      }
      
      try {
        const t = await api.fetchJSON('/api/tops?published=0');
        if (t.error) {
          console.warn('Tops API error:', t.error);
          setTops([]);
        } else {
          setTops(Array.isArray(t.tops) ? t.tops : []);
        }
      } catch (e) {
        console.warn('Failed to load tops:', e);
        setTops([]);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
    // unified authorization now uses x-admin-key header
    const key = sanitizeKey(adminKey);
    const res = await fetch('/api/categories/' + encodeURIComponent(slug), { method: 'DELETE', headers: key ? { 'x-admin-key': key } : {} });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  async function saveCategoryEdit(e) {
    e.preventDefault();
    const form = e.target;
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
      featuredProducts: Array.isArray(blogProductSlugs) ? blogProductSlugs : [],
      published
    };
    if (body.published) {
      body.publishedAt = new Date().toISOString();
    } else {
      body.publishedAt = null;
    }
    const res = await api.fetchJSON('/api/blogs', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) setError(res.error);
    else { form.reset(); setBlogContentDraft(''); setBlogProductSlugs([]); loadAll(); }
  }


  async function deleteBlog(slug) {
    const key = sanitizeKey(adminKey);
    const res = await fetch('/api/blogs/' + encodeURIComponent(slug), { method: 'DELETE', headers: { 'x-admin-key': key } });
    if (!res.ok) setError('Delete failed: ' + res.status);
    else loadAll();
  }

  async function saveBlogEdit(e) {
    e.preventDefault();
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
      featuredProducts: Array.isArray(editingBlogProductSlugs) ? editingBlogProductSlugs : [],
      published
    };
    if (body.published) {
      body.publishedAt = editingBlog?.publishedAt || new Date().toISOString();
    } else {
      body.publishedAt = null;
    }
    const target = editingBlog && (editingBlog.originalSlug || editingBlog.slug);
    const res = await api.fetchJSON('/api/blogs/' + encodeURIComponent(target), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.error) setError('Update failed: ' + res.error); else { setEditingBlog(null); setEditingBlogContent(''); setEditingBlogProductSlugs([]); loadAll(); }
  }

  // --- Tops ---
  async function createTop(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const description = (fd.get('description') || '').toString();
    const published = fd.get('published') !== null;
    // items come from topItems state - sanitize and normalize
    const rawItems = Array.isArray(topItems) ? topItems : [];
    const items = rawItems
      .filter(Boolean)
      .map((it, idx) => ({
        productSlug: it.productSlug || '',
        position: Number(it.position) || (idx + 1),
        customNote: it.customNote || ''
      }))
      .filter(i => i.productSlug);

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
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString();
    const slug = (fd.get('slug') || '').toString();
    const description = (fd.get('description') || '').toString();
    const published = fd.get('published') !== null;
    const rawItems = Array.isArray(editingTopItems) ? editingTopItems : [];
    const items = rawItems
      .filter(Boolean)
      .map((it, idx) => ({
        productSlug: it.productSlug || '',
        position: Number(it.position) || (idx + 1),
        customNote: it.customNote || ''
      }))
      .filter(i => i.productSlug);

    const body = { title, slug, description, items, published };
    const target = editingTop && (editingTop.originalSlug || editingTop.slug);
    const res = await api.fetchJSON('/api/tops/' + encodeURIComponent(target), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.error) setError('Update failed: ' + res.error); else { setEditingTop(null); setEditingTopItems([]); loadAll(); }
  }

  // Helpers for managing top items in the UI
  function addTopItem() {
    setTopItems([...topItems, { productSlug: '', position: (topItems.length + 1), customNote: '' }]);
  }
  function updateTopItem(idx, patch) {
    const copy = [...topItems]; copy[idx] = { ...copy[idx], ...patch }; setTopItems(copy);
  }
  function removeTopItem(idx) {
    const copy = [...topItems]; copy.splice(idx, 1); 
    // Update positions for remaining items
    copy.forEach((item, i) => { item.position = i + 1; });
    setTopItems(copy);
  }

  function addEditingTopItem() {
    setEditingTopItems([...editingTopItems, { productSlug: '', position: (editingTopItems.length + 1), customNote: '' }]);
  }
  function updateEditingTopItem(idx, patch) {
    const copy = [...editingTopItems]; copy[idx] = { ...copy[idx], ...patch }; setEditingTopItems(copy);
  }
  function removeEditingTopItem(idx) {
    const copy = [...editingTopItems]; copy.splice(idx, 1);
    // Update positions for remaining items
    copy.forEach((item, i) => { item.position = i + 1; });
    setEditingTopItems(copy);
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      {/* Quick Actions Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          margin: '0 0 16px 0', 
          color: '#3b82f6', 
          fontSize: '24px', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Quick Actions
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => {
              const form = document.querySelector('form[data-form="create-product"]');
              if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            📦 Add Product
          </button>
          
          <button 
            onClick={() => {
              const form = document.querySelector('form[data-form="create-category"]');
              if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            📂 Add Category
          </button>
          
          <button 
            onClick={() => {
              const form = document.querySelector('form[data-form="create-blog"]');
              if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            📰 Add Blog
          </button>
          
          <button 
            onClick={() => {
              const form = document.querySelector('form[data-form="create-top"]');
              if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🏆 Add Top
          </button>
        </div>

        {/* Admin Key Input */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#cbd5e1', 
            fontSize: '14px',
            fontWeight: '600'
          }}>
            🔑 Admin Authorization
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="password"
              placeholder="Enter admin key..." 
              value={adminKey} 
              onChange={e => setAdminKey(e.target.value)} 
              style={{ 
                flex: 1,
                padding: '12px 16px', 
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#e2e8f0',
                fontSize: '14px'
              }} 
            />
            <button 
              onClick={loadAll} 
              disabled={loading}
              style={{ 
                padding: '12px 20px',
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? '🔄' : '↻'} {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {adminKey && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ✅ Key configured (quotes auto-removed)
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      <section style={{ marginTop: 20 }}>
        <h2>Categories</h2>
        <ul>
          {categories.map(c => (
            <li key={c._id} style={{ marginBottom: 6 }}>
              {editingCategory && editingCategory._id === c._id ? (
                <form onSubmit={saveCategoryEdit} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input name="name" defaultValue={c.name} placeholder="Nume" style={{ padding: 6, flex: 1 }} />
                    <input name="slug" defaultValue={c.slug} placeholder="Slug" style={{ padding: 6, flex: 1 }} />
                  </div>
                  <input 
                    name="icon" 
                    defaultValue={c.icon || ''} 
                    placeholder="URL complet imagine header" 
                    style={{ padding: 6, width: '100%' }} 
                  />
                  <small style={{ color: '#666', marginTop: -4 }}>
                    💡 URL complet pentru imaginea header-ului (ex: https://example.com/image.jpg)
                  </small>
                  <textarea 
                    name="description" 
                    defaultValue={c.description || ''} 
                    placeholder="Descriere" 
                    style={{ padding: 6, width: '100%', minHeight: 60 }} 
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{ padding: '6px 12px' }}>Save</button>
                    <button type="button" onClick={() => setEditingCategory(null)} style={{ padding: '6px 12px' }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {c.icon && (
                    <img 
                      src={c.icon} 
                      alt={c.name} 
                      style={{ 
                        width: 40, 
                        height: 40, 
                        objectFit: 'cover', 
                        borderRadius: 4,
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong>{c.name}</strong> — {c.slug}
                    {c.icon && <div style={{ fontSize: '0.8em', color: '#666', marginTop: 2 }}>Icon: {c.icon.substring(0, 50)}...</div>}
                  </div>
                  <button onClick={() => setEditingCategory({ ...c, originalSlug: c.slug })} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteCategory(c.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createCategory} style={{ marginTop: 12 }} data-form="create-category">
          <h3>Create Category</h3>
          <input name="name" placeholder="Name" required style={{ display: 'block', marginBottom: 6, width: '100%', maxWidth: 400 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6, width: '100%', maxWidth: 400 }} />
          <input name="icon" placeholder="URL complet imagine header (ex: https://...)" style={{ display: 'block', marginBottom: 6, width: '100%', maxWidth: 400 }} />
          <small style={{ display: 'block', marginBottom: 8, color: '#888' }}>
            💡 Pentru icon: pune URL-ul complet al imaginii pentru header-ul categoriei (ex: https://example.com/image.jpg)
          </small>
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6, width: '100%', maxWidth: 400 }} />
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

          <form onSubmit={createProduct} style={{ marginTop: 12 }} data-form="create-product">
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
                  <RichTextEditor value={editingBlogContent} onChange={setEditingBlogContent} products={products} placeholder="Conținutul articolului" onInsertProduct={handleAttachBlogProductEdit} />
                  <div style={{ marginTop: 8, background: 'rgba(15,23,42,0.35)', padding: 12, borderRadius: 12, border: '1px dashed rgba(148,163,184,0.35)' }}>
                    <h4 style={{ margin: 0, color: '#cbd5f5', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Produse atașate articolului</h4>
                    {renderBlogProductList(editingBlogProductSlugs, { editing: true })}
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input name="published" type="checkbox" defaultChecked={b.published} />
                    Publicat
                  </label>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="submit">Salvează</button>
                    <button type="button" onClick={() => { setEditingBlog(null); setEditingBlogContent(''); setEditingBlogProductSlugs([]); }}>Anulează</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{b.title}</strong> — {b.slug}
                  <button onClick={() => { setEditingBlog({ ...b, originalSlug: b.slug }); setEditingBlogContent(b.content || ''); setEditingBlogProductSlugs(Array.isArray(b.featuredProducts) ? b.featuredProducts : []); }} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteBlog(b.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createBlog} style={{ marginTop: 12 }} data-form="create-blog">
          <h3>Create Blog</h3>
          <input name="title" placeholder="Title" required style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="author" placeholder="author" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="image" placeholder="image url" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <input name="tags" placeholder="tags (comma separated)" style={{ display: 'block', marginBottom: 6, padding: 10, borderRadius: 8 }} />
          <textarea name="excerpt" placeholder="Scurt rezumat (excerpt)" style={{ display: 'block', marginBottom: 12, padding: 10, borderRadius: 8 }} />
          <RichTextEditor value={blogContentDraft} onChange={setBlogContentDraft} products={products} placeholder="Conținutul articolului" onInsertProduct={handleAttachBlogProductDraft} />
          <div style={{ marginTop: 12, background: 'rgba(15,23,42,0.35)', padding: 12, borderRadius: 12, border: '1px dashed rgba(148,163,184,0.35)' }}>
            <h4 style={{ margin: 0, color: '#cbd5f5', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Produse atașate articolului</h4>
            {renderBlogProductList(blogProductSlugs)}
          </div>
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
                    <h4>Podium Items (Position-based)</h4>
                    {editingTopItems.map((it, idx) => {
                      const product = products.find(p => p.slug === it.productSlug);
                      return (
                        <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', padding: 8, background: 'rgba(15,23,42,0.3)', borderRadius: 8 }}>
                          <span style={{ minWidth: 30, fontWeight: 'bold', color: '#fbbf24' }}>#{it.position}</span>
                          <select value={it.productSlug || ''} onChange={ev => updateEditingTopItem(idx, { productSlug: ev.target.value })} style={{ minWidth: 200 }}>
                            <option value="">(select product)</option>
                            {products.map(p => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                          </select>
                          {product && <span style={{ fontSize: 12, color: '#94a3b8' }}>({product.name})</span>}
                          <input 
                            value={it.customNote || ''} 
                            onChange={ev => updateEditingTopItem(idx, { customNote: ev.target.value })} 
                            placeholder="Optional custom note" 
                            style={{ flex: 1 }}
                          />
                          <input 
                            type="number" 
                            value={it.position || ''} 
                            onChange={ev => updateEditingTopItem(idx, { position: Number(ev.target.value) })} 
                            style={{ width: 80 }}
                            min="1"
                          />
                          <button type="button" onClick={() => removeEditingTopItem(idx)}>Remove</button>
                        </div>
                      );
                    })}
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
                  <button onClick={() => {
                    setEditingTop({ ...t, originalSlug: t.slug });
                    const normalized = Array.isArray(t.items) ? t.items.filter(Boolean).map((it, idx) => ({
                      productSlug: it.productSlug || (it.productRef ? String(it.productRef) : ''),
                      position: Number(it.position) || (it.rank || idx + 1),
                      customNote: it.customNote || it.description || ''
                    })).filter(i => i.productSlug) : [];
                    setEditingTopItems(normalized);
                  }} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteTop(t.slug)} style={{ marginLeft: 8 }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={createTop} style={{ marginTop: 12 }} data-form="create-top">
          <h3>Create Top</h3>
          <input name="title" placeholder="Title" required style={{ display: 'block', marginBottom: 6 }} />
          <input name="slug" placeholder="slug" required style={{ display: 'block', marginBottom: 6 }} />
          <textarea name="description" placeholder="description" style={{ display: 'block', marginBottom: 6 }} />
          <div>
            <h4>Podium Items (Position-based)</h4>
            {topItems.map((it, idx) => {
              const product = products.find(p => p.slug === it.productSlug);
              return (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', padding: 8, background: 'rgba(15,23,42,0.3)', borderRadius: 8 }}>
                  <span style={{ minWidth: 30, fontWeight: 'bold', color: '#fbbf24' }}>#{it.position}</span>
                  <select value={it.productSlug || ''} onChange={ev => updateTopItem(idx, { productSlug: ev.target.value })} style={{ minWidth: 200 }}>
                    <option value="">(select product)</option>
                    {products.map(p => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                  </select>
                  {product && <span style={{ fontSize: 12, color: '#94a3b8' }}>({product.name})</span>}
                  <input 
                    value={it.customNote || ''} 
                    onChange={ev => updateTopItem(idx, { customNote: ev.target.value })} 
                    placeholder="Optional custom note" 
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="number" 
                    value={it.position || ''} 
                    onChange={ev => updateTopItem(idx, { position: Number(ev.target.value) })} 
                    style={{ width: 80 }}
                    min="1"
                  />
                  <button type="button" onClick={() => removeTopItem(idx)}>Remove</button>
                </div>
              );
            })}
            <button type="button" onClick={addTopItem}>Add item</button>
          </div>
          <label style={{ display: 'block', marginBottom: 6 }}><input type="checkbox" name="published" /> Publish immediately</label>
          <button type="submit">Create Top</button>
        </form>
      </section>
    </div>
  );
}
