import React from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Clock, FileText, LogOut, Youtube } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const loc = useLocation();
  const isActive = (p) => loc.pathname === p ? 'active' : '';

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ paddingBottom: '30px', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' }}>
        <h2 style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Youtube size={32} /> VidioMind
        </h2>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <a href="/dashboard" className={`nav-item ${isActive('/dashboard')}`}><Play size={20} style={{ marginRight: '10px' }} /> Dashboard</a>
        <a href="/history" className={`nav-item ${isActive('/history')}`}><Clock size={20} style={{ marginRight: '10px' }} /> History</a>
        <a href="/summary" className={`nav-item ${isActive('/summary')}`}><FileText size={20} style={{ marginRight: '10px' }} /> Result</a>
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <a href="/" className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} style={{ marginRight: '10px' }} /> Logout</a>
      </div>
    </div>
  );
};

export default Sidebar;