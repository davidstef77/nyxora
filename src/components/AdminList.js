"use client";

import { useEffect, useState, useCallback } from 'react';
import AdminPanel from './AdminPanel';
import './admin.css';

// Item card component for better visual presentation
function ItemCard({ item, section, onView, onEdit, onDelete }) {
  const isProduct = section === 'products';
  const displayName = item.name || item.title || item.slug || '(untitled)';
  
  return (
    <div
      className="card fade-in"
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
          <button
            className="action-btn"
            onClick={() => onView(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="View item"
          >
            👁️ View
          </button>
          
          <button
            className="action-btn warning"
            onClick={() => onEdit(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Edit item"
          >
            ✏️ Edit
          </button>
          
          <button
            className="action-btn error"
            onClick={() => onDelete(item)}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Delete item"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
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
          : `Create your first ${section.slice(0, -1)} to get started`
        }
      </p>
    </div>
  );
}

export default function AdminList({ adminKey, showToast, section: initialSection }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(initialSection || 'products');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const sections = ['products', 'tops', 'blogs', 'categories'];

  const fetchData = useCallback(async () => {
    if (!adminKey) {
      setError('Admin key required');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = adminKey ? { 'x-admin-key': adminKey } : undefined;
      const responses = await Promise.all(
        sections.map(section => {
          // for blogs/tops we want unpublished when key is provided
          const path = (section === 'blogs' || section === 'tops') && adminKey ? `/api/${section}?published=0` : `/api/${section}`;
          return fetch(path, { headers }).then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch ${section} (${res.status})`));
        })
      );
      
      const newData = {};
      sections.forEach((section, index) => {
        const payload = responses[index];
        // unwrap array by key (products/categories/blogs/tops) or treat as empty
        if (payload && typeof payload === 'object') {
          const arr = payload[section];
          newData[section] = Array.isArray(arr) ? arr : [];
        } else {
          newData[section] = [];
        }
      });
      
      setData(newData);
      showToast?.('Data loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please check your admin key.');
      showToast?.('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [adminKey, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleView = (item) => {
    const baseUrl = activeSection === 'categories' ? '/categories' : `/${activeSection}`;
    const url = `${baseUrl}/${item.slug}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name || item.title || item.slug}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/${activeSection}/${item.slug}`, {
        method: 'DELETE',
        headers: adminKey ? { 'x-admin-key': adminKey } : undefined
      });

      if (response.ok) {
        await fetchData();
        showToast?.('Item deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showToast?.('Failed to delete item', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const url = currentItem 
        ? `/api/${activeSection}/${currentItem.slug}`
        : `/api/${activeSection}`;
      
      const method = currentItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(adminKey ? { 'x-admin-key': adminKey } : {})
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        setShowForm(false);
        setCurrentItem(null);
        showToast?.(
          `${activeSection.slice(0, -1)} ${currentItem ? 'updated' : 'created'} successfully`,
          'success'
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast?.(error.message || 'Failed to save', 'error');
    }
  };

  const currentData = Array.isArray(data[activeSection]) ? data[activeSection] : [];
  const filteredData = currentData.filter(item => {
    if (!searchQuery) return true;
    const searchableText = `${item.name || ''} ${item.title || ''} ${item.description || ''} ${item.slug || ''}`.toLowerCase();
    return searchableText.includes(searchQuery.toLowerCase());
  });

  if (showForm) {
    return (
      <AdminPanel
        section={activeSection}
        initialData={currentItem}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setCurrentItem(null);
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="admin-list">
      {/* Header */}
      <div className="admin-header">
        <div className="section-tabs">
          {sections.map(section => (
            <button
              key={section}
              className={`tab ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
              {data[section] && <span className="count">({data[section].length})</span>}
            </button>
          ))}
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder={`Search ${activeSection}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="btn primary"
            onClick={handleCreate}
          >
            ➕ Add {activeSection.slice(0, -1)}
          </button>
          
          <button 
            className="btn secondary"
            onClick={fetchData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading {activeSection}...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="btn primary" onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredData.length === 0 ? (
              searchQuery ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No results found</h3>
                  <p>Try adjusting your search query</p>
                  <button 
                    className="btn secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <EmptyState section={activeSection} />
              )
            ) : (
              <div className="items-grid">
                {filteredData.map((item) => (
                  <ItemCard
                    key={item._id || item.slug}
                    item={item}
                    section={activeSection}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && !error && (
        <div className="admin-footer">
          <div className="stats">
            <span>
              Showing {filteredData.length} of {currentData.length} {activeSection}
            </span>
            {searchQuery && (
              <span className="search-info">
                (filtered by &ldquo;{searchQuery}&rdquo;)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}