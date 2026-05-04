import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Menu, X, Sun, Upload, FileText, Mail } from 'lucide-react';
import '../LandingPage.css';

const PrivacyPolicy = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-container">
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-top-mobile">
          <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>
            <Youtube color="#3b82f6" size={28} />
            VidioMind
          </Link>
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        
        <div className={`nav-menu-wrapper ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link to="/login" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none'}}><Youtube size={16}/> YouTube</Link>
            <Link to="/login" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none'}}><Upload size={16}/> Upload video</Link>
            <Link to="/login" className="nav-item" style={{display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none'}}><FileText size={16}/> Generate Docs</Link>
            <span className="nav-divider">|</span>
            {/* Yahan hum wapis Home (Landing Page) par bhej rahay hain */}
            <Link to="/" className="nav-item" style={{textDecoration: 'none'}}>Home</Link>
            <Link to="/" className="nav-item" style={{textDecoration: 'none'}}>About</Link>
            <Link to="/" className="nav-item" style={{textDecoration: 'none'}}>Features</Link>
          </div>

          <div className="nav-auth">
            <Link to="/login" className="nav-item" style={{textDecoration: 'none'}}>Sign Up</Link>
            <Link to="/login" className="btn-login" style={{textDecoration: 'none'}}>Login</Link>
          </div>
        </div>
      </nav>

      {/* POLICY CONTENT */}
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: '#e2e8f0', lineHeight: '1.8' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Privacy Policy</h1>
          <p style={{ color: '#94a3b8' }}>Last updated: March 03, 2026</p>
        </div>

        <p style={{ marginBottom: '30px' }}>
          This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use our services and tells you about your privacy rights and how the law protects you.
        </p>
        <p style={{ marginBottom: '40px' }}>
          We use your personal data to provide and improve our services. By using our services, you agree to the collection and use of information in accordance with this Privacy Policy.
        </p>

        {/* Section 1 */}
        <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}>Interpretation and Definitions</h2>
        <div className="policy-card">
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Interpretation</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Definitions</h3>
          <p style={{ color: '#94a3b8' }}>For the purposes of this Privacy Policy:</p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', marginTop: '10px' }}>
            <li><strong style={{ color: '#fff' }}>Account</strong> means a unique account created for you to access our Service or parts of our Service.</li>
            <li><strong style={{ color: '#fff' }}>Company</strong> refers to VidioMind.</li>
            <li><strong style={{ color: '#fff' }}>Service</strong> refers to the Website.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px' }}>Collecting and Using Your Personal Data</h2>
        <div className="policy-card">
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Types of Data Collected</h3>
          <h4 style={{ color: '#e2e8f0', marginTop: '15px' }}>Personal Data</h4>
          <p style={{ color: '#94a3b8' }}>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This may include:</p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px' }}>
            <li>Email address</li>
            <li>Usage data</li>
          </ul>

          <h4 style={{ color: '#e2e8f0', marginTop: '20px' }}>Usage Data</h4>
          <p style={{ color: '#94a3b8' }}>Usage Data is collected automatically when using the Service. It may include information such as your Device's Internet Protocol address, browser type, browser version, pages visited, time and date of your visit, time spent on those pages, and other diagnostic data.</p>
        </div>

        {/* Section 3: Use of Data */}
        <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px' }}>Use of Your Personal Data</h2>
        <div className="policy-card">
          <p style={{ color: '#94a3b8', marginBottom: '15px' }}>The Company may use Personal Data for the following purposes:</p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li><strong style={{ color: '#3b82f6' }}>To provide and maintain our Service:</strong> Including monitoring the usage of our Service.</li>
            <li><strong style={{ color: '#3b82f6' }}>To manage your Account:</strong> To manage your registration as a user of the Service.</li>
            <li><strong style={{ color: '#3b82f6' }}>To contact you:</strong> By email or other forms of electronic communication regarding updates or informative communications.</li>
            <li><strong style={{ color: '#3b82f6' }}>To manage your requests:</strong> To attend and manage your requests to us.</li>
          </ul>
        </div>

        {/* Section 4: Terms, Cookie, GDPR (Blue Border Cards) */}
        <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '15px', color: '#3b82f6' }}>§ Terms of Service</h2>
        <div className="policy-card-bordered">
          <p style={{ color: '#94a3b8', marginBottom: '15px' }}>By accessing and using VidioMind services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          <h4 style={{ color: '#fff' }}>1. Acceptance of Terms</h4>
          <p style={{ color: '#94a3b8' }}>By accessing or using our services, you agree to be legally bound by these Terms. If you do not agree with any part of these terms, you may not use our services.</p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', color: '#3b82f6' }}>§ Cookie Policy</h2>
        <div className="policy-card-bordered">
          <p style={{ color: '#94a3b8' }}>This Cookie Policy explains how VidioMind uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', color: '#3b82f6' }}>§ GDPR Compliance</h2>
        <div className="policy-card-bordered">
          <p style={{ color: '#94a3b8' }}>VidioMind is committed to ensuring the security and protection of the personal information that we process, and to provide a compliant and consistent approach to data protection in accordance with the General Data Protection Regulation (GDPR).</p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', color: '#3b82f6' }}><Mail size={20} style={{display:'inline', verticalAlign:'middle', marginRight:'8px'}}/>Contact Us</h2>
        <div className="policy-card">
          <p style={{ color: '#94a3b8' }}>If you have any questions about this Privacy Policy, you can contact us:</p>
          <a href="mailto:contact@vidiomind.ai" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>✉ contact@vidiomind.ai</a>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="nav-brand" style={{marginBottom: '1rem', textDecoration: 'none'}}>
              <Youtube color="#3b82f6" size={24} /> VidioMind
            </Link>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px'}}>
              VidioMind is your go-to free video summarizer, leveraging cutting-edge AI to deliver instant, 
              concise summaries of millions of videos.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/" style={{textDecoration: 'none'}}>Home</Link>
              <Link to="/" style={{textDecoration: 'none'}}>About Us</Link>
              <Link to="/" style={{textDecoration: 'none'}}>Features</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Our Services</h4>
            <div className="footer-links">
              <Link to="/login" style={{textDecoration: 'none'}}><Youtube size={14} style={{display:'inline', marginRight:'5px'}}/> YouTube Summarizer</Link>
              <Link to="/login" style={{textDecoration: 'none'}}><Upload size={14} style={{display:'inline', marginRight:'5px'}}/> Video Upload</Link>
              <Link to="/login" style={{textDecoration: 'none'}}><FileText size={14} style={{display:'inline', marginRight:'5px'}}/> Blog Generator</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <div className="footer-links">
              {/* DONO LINKS PRIVACY PAGE PE JAYENGI */}
              <Link to="/privacy" style={{textDecoration: 'none', color: '#3b82f6'}}>Terms of Service</Link>
              <Link to="/privacy" style={{textDecoration: 'none', color: '#3b82f6'}}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 VidioMind. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default PrivacyPolicy;