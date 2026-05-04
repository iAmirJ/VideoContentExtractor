import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Youtube, Upload, FileText, Sun, Linkedin
} from 'lucide-react';
import '../LandingPage.css';

const AboutPage = () => {
  return (
    <div className="landing-container">
      
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <Youtube color="#3b82f6" size={28} />
          VidioMind
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-item"><Youtube size={16}/> YouTube</Link>
          <Link to="/" className="nav-item"><Upload size={16}/> Upload video</Link>
          <Link to="/" className="nav-item"><FileText size={16}/> Generate Docs</Link>
          <span style={{ color: '#334155' }}>|</span>
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item" style={{color: '#3b82f6'}}>About</Link>
          <Link to="/" className="nav-item">Features</Link>
        </div>

        <div className="nav-auth">
          <button className="nav-item" style={{background:'none', border:'none', cursor:'pointer'}}><Sun size={20}/></button>
          <Link to="/login" className="nav-item">Sign Up</Link>
          <Link to="/login" className="btn-login">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-container" style={{textAlign: 'center', paddingTop: '4rem'}}>
        <h1 style={{fontSize: '3rem', color: '#3b82f6', marginBottom: '1.5rem', lineHeight: '1.2'}}>
          Transforming Digital Learning<br/>Through AI Summarization
        </h1>
        <p style={{color: 'var(--text-light)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto'}}>
          We're building advanced AI summarization technology that helps people absorb, process, and retain knowledge more effectively in the digital information age.
        </p>

        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">100K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">1M+</div>
            <div className="stat-label">Processed Videos</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">30+</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-container" style={{textAlign: 'center'}}>
        <h2 className="section-title">Our Story</h2>
        <div className="story-text" style={{textAlign: 'left'}}>
          <p style={{marginBottom: '1.5rem'}}>
            VidioMind emerged from a critical observation in today's digital landscape: despite unprecedented access to information, people struggle to effectively summarize, absorb, and retain knowledge from the overwhelming volume of digital video content available.
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Our founders experienced this challenge firsthand during their research. Despite spending countless hours watching technical lectures and reading research papers, they found themselves unable to efficiently summarize and remember crucial information within days, limiting their ability to build upon that knowledge.
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Combining cutting-edge research in cognitive science with advanced AI summarization technology, we assembled a team of experts in machine learning, educational psychology, and product design to create solutions that transform unstructured video information into concise, structured, memorable knowledge that stays with users.
          </p>
          <p>
            Today, VidioMind's suite of AI-powered summarization tools helps thousands of students, researchers, professionals, and lifelong learners extract maximum value from digital content through intelligent content distillation and transform it into lasting, applicable knowledge that drives innovation and growth.
          </p>
        </div>
      </section>

      {/* Our Journey (Timeline) */}
      <section className="section-container" style={{textAlign: 'center', background: 'var(--bg-dark)'}}>
        <h2 className="section-title" style={{marginBottom: '0'}}>Our Journey</h2>
        
        <div className="timeline">
          
          <div className="timeline-item left">
            <div className="timeline-dot">2021</div>
            <div className="timeline-content">
              <h3>Founded</h3>
              <p>VidioMind was established to address the growing information overload problem, with a mission to transform how people consume, process, and retain digital knowledge.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-dot">2022</div>
            <div className="timeline-content">
              <h3>First Product Launch</h3>
              <p>Released our AI-powered YouTube summarization tool, achieving 10,000+ active users within the first month and featured as a breakthrough in educational technology.</p>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-dot">2023</div>
            <div className="timeline-content">
              <h3>Series A Funding</h3>
              <p>Secured funding to expand our AI summarization capabilities, enhance our natural language processing models, and develop new content condensation tools.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-dot">2024</div>
            <div className="timeline-content">
              <h3>Global Expansion</h3>
              <p>Reached 100,000+ monthly active users across 30+ countries with support for multiple languages. Launched enterprise solutions for institutions.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Our Team */}
      <section className="section-container">
        <h2 className="section-title">Our Team</h2>
        
        {/* CEO Card */}
        <div className="team-card team-ceo">
          <div className="team-avatar">K</div>
          <h3 style={{margin: '0 0 10px 0'}}>Kais</h3>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
            <span className="team-role" style={{marginBottom: 0}}>Founder & CEO</span>
            <Linkedin size={18} color="#3b82f6" style={{cursor: 'pointer'}}/>
          </div>
          <p className="team-desc" style={{maxWidth: '400px'}}>
            Founder of VidioMind, passionate about building smart AI tools that make knowledge easier to access and understand.
          </p>
        </div>

        {/* Other Team Members Grid */}
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">A</div>
            <h4 style={{margin: '0 0 10px 0', fontSize: '1.1rem'}}>Abdelrahman Tony</h4>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <span className="team-role">CAIO</span>
                <Linkedin size={16} color="#3b82f6" style={{cursor: 'pointer', marginBottom: '15px'}}/>
            </div>
            <p className="team-desc">Leads AI innovation and large language model (LLM) strategy at VidioMind, driving advancements in machine learning.</p>
          </div>
          
          <div className="team-card">
            <div className="team-avatar">M</div>
            <h4 style={{margin: '0 0 10px 0', fontSize: '1.1rem'}}>Momen Motaz</h4>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <span className="team-role">CTO</span>
                <Linkedin size={16} color="#3b82f6" style={{cursor: 'pointer', marginBottom: '15px'}}/>
            </div>
            <p className="team-desc">Oversees product architecture and ensures that VidioMind's technology is scalable, efficient, and reliable.</p>
          </div>

          <div className="team-card">
            <div className="team-avatar">A</div>
            <h4 style={{margin: '0 0 10px 0', fontSize: '1.1rem'}}>Amr Hossam</h4>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <span className="team-role">Head of Backend</span>
                <Linkedin size={16} color="#3b82f6" style={{cursor: 'pointer', marginBottom: '15px'}}/>
            </div>
            <p className="team-desc">Leads backend development at VidioMind, building secure and high-performance server-side systems.</p>
          </div>

          <div className="team-card">
            <div className="team-avatar">S</div>
            <h4 style={{margin: '0 0 10px 0', fontSize: '1.1rem'}}>Sherif Thabit</h4>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <span className="team-role">Head of DevOps</span>
                <Linkedin size={16} color="#3b82f6" style={{cursor: 'pointer', marginBottom: '15px'}}/>
            </div>
            <p className="team-desc">Manages DevOps infrastructure and API development to ensure VidioMind runs smoothly and scales efficiently.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container">
        <div className="cta-card">
          <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Join Us on Our Mission to Revolutionize Content Summarization</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem'}}>
            We're always looking for passionate people to help us build the future of AI-powered summarization, knowledge processing, and digital learning.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <Link to="/" className="btn-primary">Explore Our Features</Link>
            <Link to="/" className="btn-secondary">Contact Us</Link>
          </div>
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
              <Link to="/">Features</Link>
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

export default AboutPage;