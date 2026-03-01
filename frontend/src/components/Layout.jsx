import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="app-layout">
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        <Menu />
      </button>
      <div className={`overlay ${isOpen ? 'visible' : ''}`} onClick={() => setIsOpen(false)}></div>
      <Sidebar isOpen={isOpen} />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default Layout;