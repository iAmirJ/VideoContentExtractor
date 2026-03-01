import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!link) return alert("Paste a URL!");
    setLoading(true); setStatus('Starting...');
    const userId = localStorage.getItem("user_id");
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/summarize?url=${encodeURIComponent(link)}&user_id=${userId}`);
      pollStatus(res.data.project_id);
    } catch (err) { setLoading(false); alert("Server Error"); }
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      const res = await axios.get(`http://127.0.0.1:8000/api/status/${id}`);
      if (res.data.status === 'Completed') {
        clearInterval(interval); 
        setLoading(false);

        localStorage.setItem("savedSummary", res.data.summary);
        localStorage.setItem("savedBlog", res.data.blog);
        localStorage.setItem("savedLink", link);
        
        navigate('/summary', { 
            state: { 
                summaryData: res.data.summary, 
                blogData: res.data.blog, 
                videoLink: link 
            } 
        });
      } else { setStatus(`${res.data.status} (${res.data.progress}%)`); }
    }, 1000);
  };

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>VidioMind Summarizer</h1>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>Generate summaries, blogs, and notes instantly.</p>
        <div className="card" style={{ padding: '40px', borderTop: '4px solid #2563eb' }}>
          <input type="text" placeholder="Paste YouTube URL..." className="input-field" value={link} onChange={e => setLink(e.target.value)} style={{ marginBottom: '20px' }} />
          <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><Loader2 className="spin" size={18} /> {status}</> : "Generate Summary"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;