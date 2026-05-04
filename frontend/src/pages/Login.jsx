import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Youtube, User, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // BUG FIXED: Safely check location state without crashing
  const initialMode = (location.state && location.state.isSignUp) ? true : false;
  const [isRegister, setIsRegister] = useState(initialMode);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // BUG FIXED: Watch for changes if user clicks header links while already on this page
  useEffect(() => {
    if (location.state && location.state.isSignUp !== undefined) {
      setIsRegister(location.state.isSignUp);
      setError(""); // Clear error when switching modes
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const endpoint = isRegister ? `${API_BASE_URL}/register` : `${API_BASE_URL}/login`;
    try {
      const res = await axios.post(endpoint, { email, password, username });
      if (!isRegister) {
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
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isRegister ? "Create Account" : "Welcome Back! 👋"}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>Full Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    className="custom-input"
                    placeholder="e.g. Aamir Khan" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required={isRegister} // Sirf register ke waqt required ho 
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>Email Address</label>
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>Password</label>
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

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"} 
            <span 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', marginLeft: '5px' }}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;