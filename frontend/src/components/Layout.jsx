import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is on the video-rag page
  const isVideoRagPage = location.pathname === '/video-rag';

  // User state logic
  const username = localStorage.getItem("username") || "Aamir";
  const userAvatar = username.charAt(0).toUpperCase();

  // Listen for window resize to handle mobile sidebar smoothly
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { path: "/dashboard", icon: "⚡", label: "Analyze" },
    { path: "/history", icon: "🕓", label: "History" },
    { path: "/profile", icon: "👤", label: "Profile" },
    { path: "/settings", icon: "⚙️", label: "Settings" },
  ];

  // Common colors for the new theme
  const C = { border: "rgba(255,255,255,0.08)", muted: "rgba(255,255,255,0.45)", dim: "rgba(255,255,255,0.25)" };

  // 1. If it's the Video RAG page, return just the content (Full width, no sidebar/header)
  if (isVideoRagPage) {
    return (
      <div style={{ background: "#0b0b14", minHeight: "100vh", color: "#fff", width: "100%", margin: 0, padding: 0 }}>
        {children}
      </div>
    );
  }

  // 2. Otherwise, return the full new Dashboard Layout
  return (
    // Yahan height: "100vh" aur overflow: "hidden" set kiya gaya hai
    <div style={{ background: "#0b0b14", height: "100vh", color: "#fff", fontFamily: "sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      
      {/* TOP NAVBAR */}
      <div style={{ background: "#11111a", borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 50 }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mobile Menu Button (Only shows on small screens) */}
          {isMobile && (
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Logo Area */}
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>VidioMind</div>
          {!isMobile && (
            <div style={{ fontSize: 11, color: C.muted, background: "rgba(124,58,237,0.1)", border: `1px solid rgba(124,58,237,0.4)`, padding: "3px 10px", borderRadius: 12, marginLeft: 8 }}>RAG Platform</div>
          )}
        </div>

        {/* User Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {!isMobile && <div style={{ fontSize: 13, color: C.muted }}>👋 {username}</div>}
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>{userAvatar}</div>
          <button onClick={handleSignOut} style={{ border: "none", cursor: "pointer", fontSize: 12, color: C.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            Sign out
          </button>
        </div>
      </div>

      {/* LOWER SECTION: Sidebar + Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* Mobile Overlay Background */}
        {isMobile && isOpen && (
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 30 }}
          />
        )}

        {/* SIDEBAR */}
        <div style={{ 
          width: 220, 
          background: "#11111a", 
          borderRight: `1px solid ${C.border}`, 
          padding: "20px 12px", 
          display: "flex", 
          flexDirection: "column", 
          gap: 6,
          boxSizing: "border-box", 
          height: "100%",          
          overflowY: "auto",       
          // Mobile responsive logic
          position: isMobile ? "absolute" : "static",
          left: isMobile ? (isOpen ? 0 : "-220px") : 0,
          top: 0,
          bottom: 0,
          zIndex: 40,
          transition: "left 0.3s ease"
        }}>
          {navItems.map(n => {
            const isActive = location.pathname.includes(n.path) || (n.path === "/dashboard" && location.pathname === "/");
            return (
              <button 
                key={n.path} 
                onClick={() => { navigate(n.path); if(isMobile) setIsOpen(false); }} 
                style={{ 
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, 
                  padding: "12px 16px", borderRadius: 8, textAlign: "left", 
                  background: isActive ? "rgba(124,58,237,0.15)" : "transparent", 
                  color: isActive ? "#c4b5fd" : C.muted, 
                  fontSize: 14, fontWeight: isActive ? 500 : 400,
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
              </button>
            );
          })}
          
          <div style={{ flex: 1 }} />
          
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.dim }}>Plan</div>
            <div style={{ fontSize: 13, color: "#a78bfa", marginTop: 4, fontWeight: 500 }}>Free</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 8 }}>Ready to analyze</div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, overflowY: "auto", background: "#0b0b14", position: "relative", zIndex: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}