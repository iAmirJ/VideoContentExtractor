import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Play, FileText, BookOpen, LogOut, Download, Youtube, Loader2, Menu, Clock, Share2, FileType, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './App.css';

// --- 1. LOGIN & REGISTER (Cleaned - Styles moved to CSS) ---
const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const endpoint = isRegister ? "/api/register" : "/api/login";
    try {
      const res = await axios.post(`http://127.0.0.1:8000${endpoint}`, { email, password, username });
      if(!isRegister) {
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("username", res.data.username);
        navigate('/dashboard');
      } else {
        setIsRegister(false); alert("Account created! Please login.");
      }
    } catch (err) { setError(err.response?.data?.detail || "Error occurred"); }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE (Branding) */}
      <div className="left-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', opacity: 0.9, zIndex: 1 }}></div>
        <div style={{ zIndex: 10, textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(10px)', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' 
          }}>
            <Youtube size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>VidioMind AI</h1>
          <p style={{ fontSize: '18px', color: '#dbeafe', maxWidth: '400px', lineHeight: '1.6' }}>
            Transform long YouTube videos into concise summaries and professional blog posts instantly.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="right-panel">
        <div className="form-card fade-in">
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
              {isRegister ? "Create Account" : "Welcome Back! 👋"}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {isRegister ? "Join VidioMind today" : "Enter your details to access your dashboard."}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px', fontSize:'14px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {isRegister && (
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Full Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    className="custom-input"
                    placeholder="e.g. Aamir Khan" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  className="custom-input"
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type="password" 
                  className="custom-input"
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : (isRegister ? "Get Started" : "Start Summarizing")} 
              {!loading && <ArrowRight size={20} />}
            </button>

          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"} 
            <span 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', marginLeft: '5px' }}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="app-layout">
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}><Menu /></button>
      <div className={`overlay ${isOpen?'visible':''}`} onClick={()=>setIsOpen(false)}></div>
      <Sidebar isOpen={isOpen} />
      <div className="main-content">{children}</div>
    </div>
  );
};

// --- 2. DASHBOARD ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if(!link) return alert("Paste a URL!");
    setLoading(true); setStatus('Starting...');
    const userId = localStorage.getItem("user_id");
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/summarize?url=${encodeURIComponent(link)}&user_id=${userId}`);
      pollStatus(res.data.project_id);
    } catch(err) { setLoading(false); alert("Server Error"); }
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      const res = await axios.get(`http://127.0.0.1:8000/api/status/${id}`);
      if(res.data.status === 'Completed') {
        clearInterval(interval); 
        setLoading(false);
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
          <input type="text" placeholder="Paste YouTube URL..." className="input-field" value={link} onChange={e=>setLink(e.target.value)} style={{marginBottom:'20px'}}/>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{width:'100%'}}>
            {loading ? <><Loader2 className="spin" size={18}/> {status}</> : "Generate Summary"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

// --- 3. HISTORY PAGE ---
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

// --- 4. RESULT PAGE ---
const ResultPage = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const summaryText = location.state?.summaryData || "No summary available.";
  const blogText = location.state?.blogData || "No blog generated.";

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([summaryText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '900px', margin: '30px auto' }}>
        <div className="card" style={{ padding: '20px', display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px' }}>
            <div style={{width:'60px', height:'60px', background:'#e0f2fe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <FileText size={30} color="#0284c7"/>
            </div>
            <div>
                <h2 style={{margin:0}}>Generation Complete</h2>
                <p style={{margin:0, color:'#64748b'}}>Success! Your content is ready below.</p>
            </div>
        </div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'0', borderBottom:'1px solid #e2e8f0' }}>
            <TabBtn active={activeTab==='summary'} onClick={()=>navigate('/summary', {state:location.state})} icon={<FileText size={16}/>} label="Summary" />
            <TabBtn active={activeTab==='blog'} onClick={()=>navigate('/blog', {state:location.state})} icon={<BookOpen size={16}/>} label="Blog Post" />
            <TabBtn active={activeTab==='export'} onClick={()=>navigate('/export', {state:location.state})} icon={<Share2 size={16}/>} label="Export" />
        </div>

        <div className="card" style={{ borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '30px', minHeight: '400px' }}>
            {activeTab === 'summary' && (
                <div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                        <h3>Video Summary</h3>
                        <button className="btn-primary" onClick={handleDownload} style={{fontSize:'13px', padding:'8px 15px'}}><Download size={16} style={{marginRight:'5px'}}/> Download Text</button>
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#334155' }}>{summaryText}</div>
                </div>
            )}
            
            {activeTab === 'blog' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#1e293b'}}>Generated Blog Post</h2>
                    <div style={{ lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-line' }}>
                        {blogText}
                    </div>
                </div>
            )}

            {activeTab === 'export' && (
                <div style={{textAlign:'center', paddingTop:'50px'}}>
                    <h3>Export Options</h3>
                    <div style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'30px'}}>
                        <ExportCard icon={<FileText color="#ef4444"/>} title="PDF" />
                        <ExportCard icon={<FileType color="#2563eb"/>} title="Word" />
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

const TabBtn = ({active, onClick, icon, label}) => (
    <button onClick={onClick} style={{display:'flex', gap:'8px', alignItems:'center', padding:'12px 20px', background:active?'white':'transparent', border:'1px solid transparent', borderBottom:active?'2px solid #2563eb':'none', color:active?'#2563eb':'#64748b', fontWeight:600}}>{icon} {label}</button>
);

const ExportCard = ({icon, title}) => (
    <div style={{border:'1px solid #e2e8f0', padding:'20px', borderRadius:'10px', width:'120px', cursor:'pointer'}} onClick={()=>alert("Export Module Pending")}>
        <div style={{marginBottom:'10px'}}>{icon}</div>
        <strong>{title}</strong>
    </div>
);

// --- SIDEBAR ---
const Sidebar = ({ isOpen }) => {
  const loc = useLocation();
  const isActive = (p) => loc.pathname === p ? 'active' : '';
  return (
    <div className={`sidebar ${isOpen?'open':''}`}>
      <div style={{ paddingBottom:'30px', borderBottom:'1px solid #f1f5f9', marginBottom:'20px' }}>
        <h2 style={{ color:'#2563eb', display:'flex', alignItems:'center', gap:'10px' }}><Youtube size={32} /> VidioMind</h2>
      </div>
      <nav style={{display:'flex', flexDirection:'column', gap:'5px'}}>
        <a href="/dashboard" className={`nav-item ${isActive('/dashboard')}`}><Play size={20} style={{marginRight:'10px'}}/> Dashboard</a>
        <a href="/history" className={`nav-item ${isActive('/history')}`}><Clock size={20} style={{marginRight:'10px'}}/> History</a>
        <a href="/summary" className={`nav-item ${isActive('/summary')}`}><FileText size={20} style={{marginRight:'10px'}}/> Result</a>
      </nav>
      <div style={{ marginTop:'auto' }}><a href="/" className="nav-item" style={{color:'#ef4444'}}><LogOut size={20} style={{marginRight:'10px'}}/> Logout</a></div>
    </div>
  );
};

// --- APP ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/summary" element={<ResultPage activeTab="summary" />} />
        <Route path="/blog" element={<ResultPage activeTab="blog" />} />
        <Route path="/export" element={<ResultPage activeTab="export" />} />
      </Routes>
    </Router>
  );
}

export default App;