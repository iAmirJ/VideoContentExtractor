import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const HistoryPage = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    axios.get(`http://127.0.0.1:8000/api/history/${userId}`).then(res => setProjects(res.data));
  }, []);

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '900px', margin: '30px auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Your History</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {projects.map((p) => (
            <div key={p.project_id} className="card" style={{ padding: '0', cursor:'pointer' }} onClick={() => alert("View details functionality pending")}>
              <img src={p.thumbnail_url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="thumb" />
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize:'16px' }}>{p.title || "Untitled Video"}</h4>
                <span style={{ fontSize: '12px', background: p.status==='Completed'?'#dcfce7':'#fee2e2', color: p.status==='Completed'?'#166534':'#991b1b', padding:'3px 8px', borderRadius:'10px' }}>
                  {p.status}
                </span>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;