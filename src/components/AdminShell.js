"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import AdminList from './AdminList';
import './admin.css';

// Toast component for notifications
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`toast ${type}`}
    >
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
    </motion.div>
  );
}

// Quick stats component
function QuickStats({ stats, loading }) {
  return (
    <div className="card-grid" style={{ marginBottom: '24px' }}>
      <motion.div 
        className="card"
        whileHover={{ scale: 1.02 }}
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
      </motion.div>

      <motion.div 
        className="card"
        whileHover={{ scale: 1.02 }}
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
      </motion.div>

      <motion.div 
        className="card"
        whileHover={{ scale: 1.02 }}
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
      </motion.div>
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
    <motion.div 
      className="admin-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <nav className="admin-nav">
        <div className="brand">Nyxora Admin</div>
        
        <div style={{ marginTop: 32 }}>
          {sections.map((item) => (
            <motion.button
              key={item.id}
              className={section === item.id ? 'active' : ''}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSection(item.id)}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
            Logged in as
          </div>
          <div style={{ fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
            {session?.user?.name || 'Admin'}
          </div>
          <motion.button
            className="action-btn error"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut()}
            style={{ 
              width: '100%', 
              fontSize: '14px',
              padding: '10px 16px'
            }}
          >
            🚪 Sign Out
          </motion.button>
        </div>
      </nav>

      <main className="admin-main">
        <motion.header 
          className="admin-header"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
            <motion.button 
              className="action-btn" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
            >
              🔄 Refresh
            </motion.button>
            <motion.button 
              className="action-btn" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyUrl}
            >
              📋 Copy URL
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.section 
            key={section}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
                    <motion.button
                      className="action-btn success"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSection('products')}
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      📦 Manage Products
                    </motion.button>
                    <motion.button
                      className="action-btn"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSection('categories')}
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      📂 Manage Categories
                    </motion.button>
                    <motion.button
                      className="action-btn warning"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSection('settings')}
                      style={{ padding: '16px', justifyContent: 'center' }}
                    >
                      ⚙️ Settings
                    </motion.button>
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
                <AdminList section={section} onToast={showToast} />
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
