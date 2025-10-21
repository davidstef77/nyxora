"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import './admin.css';

// Lazy load heavy components
const AdminList = lazy(() => import('./AdminList'));
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
  header: ({ children, ...props }) => <header {...props}>{children}</header>,
  section: ({ children, ...props }) => <section {...props}>{children}</section>
};
const AnimatePresence = ({ children }) => children;

// Simple loading component
function LoadingSpinner() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '40px',
      fontSize: '14px',
      color: '#94a3b8'
    }}>
      <div style={{ 
        width: '20px', 
        height: '20px', 
        border: '2px solid #3b82f6', 
        borderTop: '2px solid transparent', 
        borderRadius: '50%',
        marginRight: '12px',
        animation: 'spin 1s linear infinite'
      }}></div>
      Loading...
    </div>
  );
}

// Toast component for notifications (simplified)
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      background: type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#10b981',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(0)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>
          {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <span>{message}</span>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '18px',
            marginLeft: '12px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Quick stats component (simplified)
function QuickStats({ stats, loading }) {
  return (
    <div className="card-grid" style={{ marginBottom: '24px' }}>
      <div 
        className="card"
        style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Total Products</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>
              {loading ? '...' : (stats?.products || 0)}
            </div>
          </div>
          <div style={{ fontSize: '40px', opacity: 0.6 }}>📦</div>
        </div>
      </div>

      <div 
        className="card"
        style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Categories</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
              {loading ? '...' : (stats?.categories || 0)}
            </div>
          </div>
          <div style={{ fontSize: '40px', opacity: 0.6 }}>📂</div>
        </div>
      </div>

      <div 
        className="card"
        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Admin Status</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>
              Active Session
            </div>
          </div>
          <div style={{ fontSize: '40px', opacity: 0.6 }}>⚡</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell() {
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { data: session } = useSession();

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '📂' },
    { id: 'blogs', label: 'Blogs', icon: '📰' },
    { id: 'tops', label: 'Topuri', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Fetch dashboard stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, categoriesRes, blogsRes, topsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/blogs'),
          fetch('/api/tops')
        ]);
        
        const [productsData, categoriesData, blogsData, topsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          blogsRes.json(),
          topsRes.json()
        ]);

        setStats({
          products: productsData.products?.length || 0,
          categories: categoriesData.categories?.length || 0,
          blogs: blogsData.blogs?.length || 0,
          tops: topsData.tops?.length || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        showToast('Failed to load dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

    const showToast = useCallback((message, type = 'success') => {
      setToast({ message, type });
    }, []);

  const refreshData = () => {
    setLoading(true);
    window.location.reload();
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('URL copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <div 
      className="admin-shell"
      style={{ opacity: 1, transition: 'opacity 0.6s' }}
    >
      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <nav className="admin-nav">
        <div className="brand">Nyxora Admin</div>
        
        <div style={{ marginTop: 32 }}>
          {sections.map((item) => (
            <button
              key={item.id}
              className={section === item.id ? 'active' : ''}
              style={{
                transform: section === item.id ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s'
              }}
              onClick={() => setSection(item.id)}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
            Logged in as
          </div>
          <div style={{ fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
            {session?.user?.name || 'Admin'}
          </div>
          <button
            className="action-btn error"
            onClick={() => signOut()}
            style={{ 
              width: '100%', 
              fontSize: '14px',
              padding: '10px 16px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚪 Sign Out
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <header 
          className="admin-header"
          style={{ transform: 'translateY(0)', opacity: 1, transition: 'all 0.4s' }}
        >
          <div>
            <h1 className="admin-title">
              {sections.find(s => s.id === section)?.icon} {sections.find(s => s.id === section)?.label}
            </h1>
            <div className="admin-sub">
              Manage your e-commerce platform with ease and efficiency
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="action-btn" 
              onClick={refreshData}
              style={{
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🔄 Refresh
            </button>
            <button 
              className="action-btn" 
              onClick={copyUrl}
              style={{
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              📋 Copy URL
            </button>
          </div>
        </header>

        <section 
          key={section}
          style={{ 
            transform: 'translateY(0)', 
            opacity: 1, 
            transition: 'all 0.3s' 
          }}
          className="fade-in"
        >
          {section === 'overview' ? (
            <div>
              <QuickStats stats={stats} loading={loading} />
              
              <div className="card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                  🚀 Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <button
                    className="action-btn success"
                    onClick={() => setSection('products')}
                    style={{ 
                      padding: '16px', 
                      justifyContent: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    📦 Manage Products
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setSection('categories')}
                    style={{ 
                      padding: '16px', 
                      justifyContent: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    📂 Manage Categories
                  </button>
                  <button
                    className="action-btn warning"
                    onClick={() => setSection('settings')}
                    style={{ 
                      padding: '16px', 
                      justifyContent: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>

              <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                  📈 System Health
                </h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="status-badge success">
                    🟢 Database Connected
                  </div>
                  <div className="status-badge success">
                    🔐 Authentication Active
                  </div>
                  <div className="status-badge success">
                    ⚡ API Responsive
                  </div>
                </div>
              </div>
            </div>
          ) : section === 'settings' ? (
            <div className="card">
              <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700' }}>
                ⚙️ System Settings
              </h3>
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                <h4>Settings panel coming soon</h4>
                <p>Configure system preferences, user management, and integrations.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminList section={section} onToast={showToast} />
              </Suspense>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
