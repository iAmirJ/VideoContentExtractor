import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import Layout from '../components/Layout';

const HistoryPage = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || 1;
    axios.get(`${API_BASE_URL}/history/${userId}`)
      .then(res => setProjects(res.data))
      .catch(err => console.error("Error fetching history:", err));
  }, []);

  const handleReAnalyze = (url) => {
    navigate('/dashboard', { state: { prefillUrl: url } }); 
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const truncateWords = (text, limit) => {
    if (!text) return "Untitled Video Analysis";
    const words = text.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return text;
  };

  return (
    <Layout>
      {/* CENTERING WRAPPER START */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        width: '100%', 
        minHeight: '100vh',
        padding: "32px 40px", // Padding thori adjust ki taake Profile jaisi lagay
        boxSizing: "border-box"
      }}>
        
        {/* MAIN CONTENT BOX (Max Width ko 1100px kar diya hy Profile ki tarah) */}
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10 }}>
            <span>🕓</span> Analysis History
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: "100%" }}>
            {projects.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.4)", padding: "20px 0" }}>No history found yet.</div>
            ) : (
              projects.map((p) => (
                <div 
                  key={p.project_id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: '#151521', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '10px', 
                    padding: '14px 18px',
                    width: '100%', 
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                >
                  {/* Left Side Container */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    
                    {/* Thumbnail */}
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      background: 'rgba(255,255,255,0.05)',
                      flexShrink: 0
                    }}>
                      <img 
                        src={p.thumbnail_url} 
                        alt="thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    {/* Title & Status */}
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 550, 
                        color: '#fff', 
                        marginBottom: '4px',
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {truncateWords(p.title, 7)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{formatDate(p.created_at)}</span>
                        <span>•</span>
                        <span style={{ 
                          color: p.status === 'Completed' ? '#34d399' : (p.status === 'Failed' ? '#f87171' : '#fbbf24') 
                        }}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Re-analyze Button */}
                  <div style={{ flexShrink: 0 }}>
                    <button 
                      onClick={() => handleReAnalyze(p.source_url)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid rgba(124,58,237,0.5)', 
                        color: '#d8b4fe', 
                        padding: '6px 14px', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap', 
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(124,58,237,0.1)'}
                      onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      Re-analyze
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
        {/* MAIN CONTENT BOX END */}

      </div>
      {/* CENTERING WRAPPER END */}
    </Layout>
  );
};

export default HistoryPage;