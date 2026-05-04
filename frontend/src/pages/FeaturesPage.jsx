import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Youtube, Upload, FileText, Sun, ChevronRight, 
  Tag, Library, Share2, Search, CheckCircle, RefreshCw
} from 'lucide-react';
import '../LandingPage.css';

const FeaturesPage = () => {
  return (
    <div className="landing-container">
      
      {/* Navbar - (Saray Links Working) */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <Youtube color="#3b82f6" size={28} />
          VidioMind
        </Link>
        
        <div className="nav-links">
          <Link to="/login" className="nav-item"><Youtube size={16}/> YouTube</Link>
          <Link to="/features" className="nav-item"><Upload size={16}/> Upload video</Link>
          <Link to="/features" className="nav-item"><FileText size={16}/> Generate Docs</Link>
          <span style={{ color: '#334155' }}>|</span>
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About</Link>
          <Link to="/features" className="nav-item" style={{color: '#3b82f6'}}>Features</Link>
        </div>

        <div className="nav-auth">
          <button className="nav-item" style={{background:'none', border:'none', cursor:'pointer'}}><Sun size={20}/></button>
          <Link to="/login" className="nav-item">Sign Up</Link>
          <Link to="/login" className="btn-login">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="features-hero">
        <h1>Advanced <span>Summarization</span> Tools</h1>
        <p>
          Our AI-powered summarization technology helps you process, understand, and retain 
          information from various video sources faster and more effectively.
        </p>
      </section>

      {/* Main Feature Cards Grid (4 Cards) */}
      <section className="section-container" style={{paddingTop: '0'}}>
        <div className="large-features-grid">
          
          <div className="large-feature-card">
            <div className="large-icon-wrapper">
              <Youtube color="#ef4444" size={24}/>
            </div>
            <h3>YouTube Summarization</h3>
            <p>Extract key points, timestamps, and summaries from any YouTube video with a single click. Save hours of watching with our AI-powered video analysis.</p>
            <Link to="/login" className="try-it-link">Try it now <ChevronRight size={16}/></Link>
          </div>

          <div className="large-feature-card">
            <div className="large-icon-wrapper">
              <Upload color="#8b5cf6" size={24}/>
            </div>
            <h3>Local Video Upload</h3>
            <p>Have a local lecture or meeting recording? Upload your MP4 or video files directly to our platform and let AI extract the most valuable insights for you.</p>
            <Link to="/login" className="try-it-link">Try it now <ChevronRight size={16}/></Link>
          </div>

          <div className="large-feature-card">
            <div className="large-icon-wrapper">
              <FileText color="#10b981" size={24}/>
            </div>
            <h3>Generate Docs & Blogs</h3>
            <p>Turn long videos into perfectly structured blog posts, articles, or study notes. Automatically format content with headings and bullet points for easy reading.</p>
            <Link to="/login" className="try-it-link">Try it now <ChevronRight size={16}/></Link>
          </div>

          <div className="large-feature-card">
            <div className="large-icon-wrapper">
              <Share2 color="#f59e0b" size={24}/>
            </div>
            <h3>Multi-format Export</h3>
            <p>Once your summary or blog is ready, easily export it in multiple formats including PDF, Word (DOCX), or PowerPoint (PPT) to share with your team or class.</p>
            <Link to="/login" className="try-it-link">Try it now <ChevronRight size={16}/></Link>
          </div>

        </div>
      </section>

      {/* Advanced Capabilities Section */}
      <section className="section-container" style={{paddingTop: '0'}}>
        <h2 className="section-title">Advanced Summarization Capabilities</h2>
        
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon"><Tag size={20}/></div>
            <div className="capability-text">
              <h4>Auto Categorization</h4>
              <p>Content automatically organized by topic and relevance for easy navigation.</p>
            </div>
          </div>
          <div className="capability-card">
            <div className="capability-icon"><Library size={20}/></div>
            <div className="capability-text">
              <h4>Knowledge History</h4>
              <p>Store all your past summaries in a searchable personal database dashboard.</p>
            </div>
          </div>
          <div className="capability-card">
            <div className="capability-icon"><RefreshCw size={20}/></div>
            <div className="capability-text">
              <h4>Fast Processing</h4>
              <p>Optimized cloud processing that generates results in seconds, not hours.</p>
            </div>
          </div>
          <div className="capability-card">
            <div className="capability-icon"><Share2 size={20}/></div>
            <div className="capability-text">
              <h4>Export Anywhere</h4>
              <p>Share or export your summaries in multiple formats (PDF, Word, PPT).</p>
            </div>
          </div>
          <div className="capability-card">
            <div className="capability-icon"><Search size={20}/></div>
            <div className="capability-text">
              <h4>Key Point Search</h4>
              <p>Powerful extraction capabilities that find the most important ideas in your video.</p>
            </div>
          </div>
          <div className="capability-card">
            <div className="capability-icon"><CheckCircle size={20}/></div>
            <div className="capability-text">
              <h4>High Accuracy</h4>
              <p>Maintain accurate and relevant summaries utilizing state-of-the-art AI models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container" style={{paddingTop: '0'}}>
        <div className="cta-card" style={{padding: '3rem'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Ready to Transform How You Process Information?</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2.5rem'}}>
            Join thousands of students, researchers, and professionals who save hours every day with our AI-powered summarization tools.
          </p>
          <Link to="/login" className="btn-primary" style={{padding: '1rem 3rem', fontSize: '1.1rem'}}>Try VidioMind Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="nav-brand" style={{marginBottom: '1rem'}}>
              <Youtube color="#3b82f6" size={24} /> VidioMind
            </Link>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px'}}>
              VidioMind is your go-to free video summarizer, leveraging cutting-edge AI to deliver instant, 
              concise summaries of millions of videos. Connect with us and explore the power of simplified video understanding!
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/features">Features</Link>
              <Link to="/">Contact</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Our Services</h4>
            <div className="footer-links">
              <Link to="/"><Youtube size={14} style={{display:'inline', marginRight:'5px'}}/> YouTube Summarizer</Link>
              <Link to="/"><Upload size={14} style={{display:'inline', marginRight:'5px'}}/> Video Upload</Link>
              <Link to="/"><FileText size={14} style={{display:'inline', marginRight:'5px'}}/> Blog Generator</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <div className="footer-links">
              <Link to="/">Terms of Service</Link>
              <Link to="/">Privacy Policy</Link>
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

export default FeaturesPage;