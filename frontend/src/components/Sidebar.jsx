import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Youtube, Zap, History, User, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { name: 'Analyze', path: '/dashboard', icon: <Zap size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '28px', paddingLeft: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-icon" style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.08)' }}>
            <Youtube color="#7c3aed" size={18} />
          </div>
          <div>
            <h1 className="brand-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>VidioMind</h1>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              <span className="platform-badge" style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', color: '#fff', padding: '4px 8px', borderRadius: 999 }}>RAG Platform</span>
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
            <span className="nav-label">{item.name}</span>
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} className="nav-item logout-btn" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
        <LogOut size={18} color="#ef4444" />
        <span style={{ color: '#ef4444' }}>Sign out</span>
      </button>
    </aside>
  );
};

export default Sidebar;