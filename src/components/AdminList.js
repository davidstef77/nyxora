"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import './admin.css';

// Item card component for better visual presentation
function ItemCard({ item, section, onView, onEdit, onDelete }) {
  const isProduct = section === 'products';
  const displayName = item.name || item.title || item.slug || '(untitled)';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="card"
      style={{ 
        marginBottom: '16px', 
        cursor: 'pointer',
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: '#fff', 
            fontSize: '18px', 
            fontWeight: '600',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {displayName}
          </h4>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <span className="status-badge success" style={{ fontSize: '11px' }}>
              📝 {item.slug}
            </span>
            
            {isProduct && item.displayPrice && (
              <span className="status-badge warning" style={{ fontSize: '11px' }}>
                💰 {item.displayPrice}
              </span>
            )}
            
            {isProduct && item.category && (
              <span className="status-badge" style={{ 
                fontSize: '11px',
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6'
              }}>
                📂 {item.category}
              </span>
            )}
          </div>
          
          {item.description && (
            <p style={{ 
              color: 'var(--muted)', 
              fontSize: '14px', 
              margin: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {item.description}
            </p>
          )}
        </div>
        
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="action-btn"
            onClick={() => onView(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="View item"
          >
            👁️ View
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="action-btn warning"
            onClick={() => onEdit(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Edit item"
          >
            ✏️ Edit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="action-btn error"
            onClick={() => onDelete(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Delete item"
          >
            🗑️ Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state component
function EmptyState({ section }) {
  const isProducts = section === 'products';
  
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {isProducts ? '📦' : '📂'}
      </div>
      <h3 style={{ color: '#fff', marginBottom: '8px' }}>
        No {section} found
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {isProducts 
          ? 'Start by creating your first product to build your catalog'
          : 'Create categories to organize your products effectively'
        }
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="action-btn success"
      >
        ➕ Create {isProducts ? 'Product' : 'Category'}
      </motion.button>
    </div>
  );
}

export default function AdminList({ section, onToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      if (section === 'products') {
        const res = await fetch('/api/products');
        const json = await res.json();
        setData(json.products || []);
        onToast?.(`Loaded ${json.products?.length || 0} products`, 'success');
      } else if (section === 'categories') {
        const res = await fetch('/api/categories');
        const json = await res.json();
        setData(json.categories || []);
        onToast?.(`Loaded ${json.categories?.length || 0} categories`, 'success');
      } else if (section === 'blogs') {
        const res = await fetch('/api/blogs');
        const json = await res.json();
        setData(json.blogs || []);
        onToast?.(`Loaded ${json.blogs?.length || 0} blogs`, 'success');
      } else if (section === 'tops') {
        const res = await fetch('/api/tops');
        const json = await res.json();
        setData(json.tops || []);
        onToast?.(`Loaded ${json.tops?.length || 0} tops`, 'success');
      } else {
        setData([]);
      }
    } catch (err) {
      const errorMsg = String(err);
      setError(errorMsg);
      onToast?.(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
    setSearchTerm(''); // Reset search when section changes
  }, [section]);

  // Filter and sort data
  const filteredAndSortedData = data
    .filter(item => {
      const name = (item.name || item.title || '').toLowerCase();
      const slug = (item.slug || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const term = (searchTerm || '').toLowerCase();
      return name.includes(term) || slug.includes(term) || desc.includes(term);
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const aName = (a.name || a.title || '').toLowerCase();
        const bName = (b.name || b.title || '').toLowerCase();
        return aName.localeCompare(bName);
      }
      if (sortBy === 'slug') {
        const aSlug = (a.slug || '').toLowerCase();
        const bSlug = (b.slug || '').toLowerCase();
        return aSlug.localeCompare(bSlug);
      }
      if (sortBy === 'created') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  const handleView = (item) => {
    let url = '/';
    if (section === 'products') url = `/products/${encodeURIComponent(item.slug)}`;
    else if (section === 'categories') url = `/categories/${encodeURIComponent(item.slug)}`;
    else if (section === 'blogs') url = `/blog/${encodeURIComponent(item.slug)}`;
    else if (section === 'tops') url = `/tops/${encodeURIComponent(item.slug)}`;
    window.open(url, '_blank');
  };

  const handleEdit = (item) => {
    // open modal with item data
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    (async () => {
      try {
        const adminKey = (() => { try { return localStorage.getItem('adminKey') || ''; } catch (e) { return ''; } })();
        let url = '/api/products/' + encodeURIComponent(item.slug);
        if (section === 'categories') url = '/api/categories/' + encodeURIComponent(item.slug);
        if (section === 'blogs') url = '/api/blogs/' + encodeURIComponent(item.slug);
        if (section === 'tops') url = '/api/tops/' + encodeURIComponent(item.slug);
        const res = await fetch(url, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
        if (!res.ok) {
          const txt = await res.text();
          onToast?.(`Delete failed: ${res.status} ${txt}`, 'error');
        } else {
          onToast?.(`Deleted ${item.name}`, 'success');
          load();
        }
      } catch (err) {
        onToast?.(String(err), 'error');
      }
    })();
  };

  return (
    <div>
      {/* Header with controls */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <input
              type="text"
              placeholder={`Search ${section}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px', margin: 0 }}
            />
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              fontSize: '16px'
            }}>
              🔍
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '120px', margin: 0 }}
          >
            <option value="name">Sort by Name</option>
            <option value="slug">Sort by Slug</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button 
            className="action-btn" 
            onClick={load}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" style={{ margin: 0 }} />
            ) : (
              '🔄'
            )} Reload
          </motion.button>
        </div>
      </div>

      {/* Results summary */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '12px 16px', 
        background: 'var(--panel-bg)', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span className="muted">
          Showing {filteredAndSortedData.length} of {data.length} {section}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        {searchTerm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setSearchTerm('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕ Clear search
          </motion.button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>❌</span>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#ef4444' }}>Error loading {section}</h4>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
          <p className="muted">Loading {section}...</p>
        </motion.div>
      )}

      {/* Content */}
      {!loading && !error && (
        <AnimatePresence>
          {filteredAndSortedData.length === 0 ? (
            <EmptyState section={section} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              layout
            >
              {filteredAndSortedData.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  section={section}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

          {/* Edit modal */}
          {modalOpen && editingItem && (
            <div className="modal-backdrop">
              <div className="modal card">
                <h3 style={{ marginTop: 0 }}>Edit {editingItem.name}</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const body = {
                    name: form.name.value,
                    slug: form.slug.value,
                    description: form.description.value,
                    category: form.category.value || null,
                    images: form.images.value ? form.images.value.split(',').map(s => s.trim()).filter(Boolean) : [],
                    affiliateLinks: (() => {
                      try { return JSON.parse(form.affiliateLinks.value); } catch (e) { return editingItem.affiliateLinks || []; }
                    })()
                  };

                  try {
                    const adminKey = (() => { try { return localStorage.getItem('adminKey') || ''; } catch (e) { return ''; } })();
                    const res = await fetch('/api/products/' + encodeURIComponent(editingItem.slug), { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify(body) });
                    const json = await res.json();
                    if (!res.ok) {
                      onToast?.(`Update failed: ${json.error || res.status}`, 'error');
                    } else {
                      onToast?.(`Updated ${json.product?.name || editingItem.name}`, 'success');
                      setModalOpen(false);
                      setEditingItem(null);
                      load();
                    }
                  } catch (err) {
                    onToast?.(String(err), 'error');
                  }
                }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <input name="name" defaultValue={editingItem.name} placeholder="Name" required />
                    <input name="slug" defaultValue={editingItem.slug} placeholder="slug" required />
                    <input name="category" defaultValue={editingItem.category || ''} placeholder="category slug" />
                    <input name="images" defaultValue={(editingItem.images || []).join(', ')} placeholder="images (comma separated)" />
                    <textarea name="description" defaultValue={editingItem.description || ''} placeholder="description" />
                    <label style={{ color: 'var(--muted)', fontSize: 12 }}>Affiliate Links (JSON array)</label>
                    <textarea name="affiliateLinks" defaultValue={JSON.stringify(editingItem.affiliateLinks || [])} rows={4} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="action-btn success">Save</button>
                      <button type="button" className="action-btn" onClick={() => { setModalOpen(false); setEditingItem(null); }}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* Quick actions panel */}
      {!loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '32px' }}
        >
          <div className="card">
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#fff', 
              fontSize: '20px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚡ Quick Actions
            </h3>
            <AdminPanel onToast={onToast} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
