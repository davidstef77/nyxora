"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminPanel from './AdminPanel';
import './admin.css';

export default function AdminList({ section }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      if (section === 'products') {
        const res = await fetch('/api/products');
        const json = await res.json();
        setData(json.products || []);
      } else if (section === 'categories') {
        const res = await fetch('/api/categories');
        const json = await res.json();
        setData(json.categories || []);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [section]);

  async function runSeed() {
    setLoading(true);
    setError('');
    try {
      const adminKey = localStorage.getItem('adminKey') || '';
      const res = await fetch('/api/seed', { method: 'POST', headers: { 'x-admin-key': adminKey } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Seed failed');
      await load();
      alert('Seed completed');
    } catch (err) {
      setError(String(err));
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <button className="action-btn" onClick={load}>Reload</button>
          <button className="action-btn" style={{ marginLeft: 8 }} onClick={runSeed}>Seed DB</button>
          <span className="seed-note">Use Seed to populate demo data</span>
        </div>
      </div>

      {error && <div style={{ color: '#ffb4b4' }}>{error}</div>}
      {loading && <div style={{ color: '#fff' }}>Loading...</div>}

      <div style={{ marginTop: 12 }} className="card">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th style={{ textAlign: 'left' }}>Slug</th>
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td>
                  <button className="action-btn" onClick={() => window.open(`/products/${encodeURIComponent(item.slug)}`, '_blank')}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ color: '#fff' }}>Quick actions</h3>
        <AdminPanel />
      </div>
    </div>
  );
}
