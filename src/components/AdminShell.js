"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminList from './AdminList';
import './admin.css';

export default function AdminShell() {
  const [section, setSection] = useState('products');

  return (
    <motion.div 
      className="admin-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="admin-nav nav">
        <div className="brand">Nyxora</div>
        <div style={{ marginTop: 18 }}>
          <motion.button whileHover={{ x: 4 }} onClick={() => setSection('products')}>Products</motion.button>
          <motion.button whileHover={{ x: 4 }} onClick={() => setSection('categories')}>Categories</motion.button>
          <motion.button whileHover={{ x: 4 }} onClick={() => setSection('media')}>Media</motion.button>
          <motion.button whileHover={{ x: 4 }} onClick={() => setSection('settings')}>Settings</motion.button>
        </div>
        <div style={{ marginTop: 20 }} className="muted">Logged in as <strong>admin</strong></div>
      </nav>

      <main className="admin-main">
        <motion.header 
          className="admin-header"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h1 className="admin-title" style={{ margin: 0 }}>{section.charAt(0).toUpperCase() + section.slice(1)}</h1>
            <div className="admin-sub">Nyxora admin dashboard — manage products, categories and affiliate links</div>
          </div>
          <div>
            <motion.button className="action-btn" whileHover={{ scale: 1.05 }} onClick={() => window.location.reload()}>Refresh</motion.button>
            <motion.button className="action-btn" whileHover={{ scale: 1.05 }} style={{ marginLeft: 8 }} onClick={() => { navigator.clipboard && navigator.clipboard.writeText(window.location.href); }}>Copy URL</motion.button>
          </div>
        </motion.header>

        <motion.section 
          style={{ marginTop: 20 }}
          key={section}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card">
            <AdminList section={section} />
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
}
