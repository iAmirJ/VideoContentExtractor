import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Youtube, Upload, FileText, MessageSquare, 
  Monitor, Brain, Zap, Share2, Clock, Globe, Quote, Mail, MapPin,
  Link as LinkIcon, Sparkles, ArrowRight, Menu, X, User, LogOut 
} from 'lucide-react';
import '../LandingPage.css';

// ==========================================
// SLIDER COMPONENT
// ==========================================
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      icon: <LinkIcon size={36} color="#3b82f6" />,
      title: "Step 1: Paste Your Link",
      desc: "Paste the link to the content you want to summarize (YouTube video, web article, research paper, or Reddit post)"
    },
    {
      icon: <Sparkles size={36} color="#3b82f6" />,
      title: "Step 2: AI Processing",
      desc: "Our advanced AI analyzes the content and extracts the key points in seconds"
    },
    {
      icon: <FileText size={36} color="#3b82f6" />,
      title: "Step 3: Ready Summary",
      desc: "Get an accurate and comprehensive summary that saves you time and helps you understand quickly"
    },
    {
      icon: <MessageSquare size={36} color="#3b82f6" />,
      title: "Join Our Community!",
      desc: "Have questions or want to connect with other users? Join our Discord server for support.",
      btn: "Join our Discord"
    }
  ];

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`}>
          <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '1.5rem'}}>
            {slide.icon}
          </div>
          <h3 style={{fontSize: '1.4rem', marginBottom: '1rem'}}>{slide.title}</h3>
          <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: slide.btn ? '1.5rem' : '0'}}>
            {slide.desc}
          </p>
          {slide.btn && <button className="btn-primary" style={{width: '100%'}}>{slide.btn}</button>}
        </div>
      ))}
      
      <button 
        className="slider-nav-btn"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>
        <ArrowRight size={18} />
      </button>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// CHOTE COMPONENTS
// ==========================================
const FeatureCard = ({ icon, title, desc }) => (
  <div className="card">
    <div className="card-icon">{icon}</div>
    <h3 style={{marginBottom: '10px', fontSize: '1.1rem'}}>{title}</h3>
    <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>{desc}</p>
  </div>
);

const TestimonialCard = ({ quote, name, role }) => (
  <div className="card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
    <div>
      <Quote size={30} color="#334155" style={{marginBottom: '15px'}}/>
      <p style={{color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '20px'}}>
        "{quote}"
      </p>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
      <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
        {name.charAt(0)}
      </div>
      <div>
        <h4 style={{margin: '0 0 3px 0', fontSize: '0.9rem'}}>{name}</h4>
        <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem'}}>{role}</p>
      </div>
    </div>
  </div>
);

// ==========================================
// MAIN LANDING PAGE
// ==========================================
const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check agar user logged in hai localStorage se
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user'); // User ka data remove karein
    setUser(null);
    navigate('/'); // Wapis home pe bhej dein
  };

  // Smooth scroll function
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false); 
    
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="landing-container">
      
      {/* NAVBAR WITH MOBILE MENU */}
      <nav className="navbar" id="home">
        <div className="nav-top-mobile">
          <a href="#home" className="nav-brand" onClick={(e) => handleScrollToSection(e, 'home')} style={{textDecoration: 'none'}}>
            <Youtube color="#3b82f6" size={28} />
            VidioMind
          </a>
          
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        
        <div className={`nav-menu-wrapper ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {/* Jab user logged in ho to links dashboard ki taraf le jayen, warna login pe */}
            <Link to={user ? "/dashboard" : "/login"} className="nav-item"><Youtube size={16}/> YouTube</Link>
            <Link to={user ? "/dashboard" : "/video-rag"} className="nav-item"><Upload size={16}/> Upload video</Link>
            <Link to={user ? "/dashboard" : "/login"} className="nav-item"><FileText size={16}/> Generate Docs</Link>
            <span style={{ color: '#334155', display: 'none', '@media(min-width: 768px)': {display: 'inline'} }}>|</span>
            <a href="#home" className="nav-item" style={{color: '#3b82f6', textDecoration: 'none'}} onClick={(e) => handleScrollToSection(e, 'home')}>Home</a>
            <a href="#about" className="nav-item" style={{textDecoration: 'none'}} onClick={(e) => handleScrollToSection(e, 'about')}>About</a>
            <a href="#features" className="nav-item" style={{textDecoration: 'none'}} onClick={(e) => handleScrollToSection(e, 'features')}>Features</a>
          </div>

          <div className="nav-auth">
            {user ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <Link to="/dashboard" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-light)'}}>
                  <div style={{background: 'rgba(59, 130, 246, 0.2)', padding: '5px', borderRadius: '50%', display: 'flex'}}>
                    <User size={20} color="#3b82f6" />
                  </div>
                  <span style={{fontWeight: '500'}}>{user.username || 'My Profile'}</span>
                </Link>
                <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500'}}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <>
                {/* State bhejne ka safe tareeqa */}
                <Link to="/login" state={{ isSignUp: true }} className="nav-item" style={{textDecoration: 'none'}}>Sign Up</Link>
                <Link to="/login" state={{ isSignUp: false }} className="btn-login" style={{textDecoration: 'none'}}>Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-container hero-section">
        <div className="hero-content">
          <h2>VidioMind</h2>
          <h1>YouTube Video Summarizer | Extract Key Insights</h1>
          <p>
            Extract key insights from YouTube videos instantly. Save time and get the main points 
            without watching hours of content. Our AI summarizer delivers accurate, concise summaries.
          </p>
          <div className="hero-buttons">
            <Link to={user ? "/dashboard" : "/login"} className="btn-primary">Summarize Now</Link>
            <a href="#about" className="btn-secondary" style={{textDecoration: 'none'}} onClick={(e) => handleScrollToSection(e, 'about')}>Learn More</a>
          </div>
        </div>
        
        <HeroSlider />
        
      </section>

      {/* Choose Type Section */}
      <section className="section-container" style={{paddingTop: '0'}}>
        <h2 className="section-title">Choose the type of summarization you need</h2>
        <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem'}}>
          Select the content type you want to summarize and use the power of AI to save your time
        </p>
        
        <div className="type-grid">
          <div className="card" style={{textAlign: 'center', cursor: 'pointer'}}>
            <Youtube size={40} color="#ef4444" style={{marginBottom: '1rem'}}/>
            <h3>YouTube</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px'}}>Summarize YouTube videos</p>
          </div>
          <div className="card" style={{textAlign: 'center', cursor: 'pointer'}}>
            <Upload size={40} color="#8b5cf6" style={{marginBottom: '1rem'}}/>
            <h3>Upload video</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px'}}>Summarize your local videos</p>
          </div>
          <div className="card" style={{textAlign: 'center', cursor: 'pointer'}}>
            <FileText size={40} color="#10b981" style={{marginBottom: '1rem'}}/>
            <h3>Generate Docs</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px'}}>Create blogs and notes</p>
          </div>
        </div>
      </section>

      {/* AI Features Details */}
      <section id="features" className="section-container">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', justifyContent: 'center'}}>
            <Youtube color="#ef4444" size={32}/>
            <h2 style={{fontSize: '2rem', margin: 0, textAlign: 'center'}}>AI-Powered Video Summarization</h2>
        </div>
        <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto'}}>
          Save time and extract key insights from any video with our advanced AI summarization technology. 
          Get the essence of any video content in minutes.
        </p>

        <div className="features-grid">
          <FeatureCard icon={<Monitor size={32}/>} title="AI-Powered Video Summarization" desc="Transform lengthy videos into concise, actionable summaries. Save hours of viewing time with up to 98% accuracy." />
          <FeatureCard icon={<Brain size={32}/>} title="Key Points Extraction" desc="Extract key points and important ideas automatically. Our AI identifies the most valuable information." />
          <FeatureCard icon={<Zap size={32}/>} title="Instant Content Analysis" desc="Get instant analysis including main topics, concepts, and ideas. Works with any type of video content." />
          <FeatureCard icon={<Share2 size={32}/>} title="Shareable Summaries" desc="Easily share summaries with colleagues or friends in multiple formats like PDF, Word, or plain text." />
          <FeatureCard icon={<Clock size={32}/>} title="Time-Saving Tool" desc="Save up to 90% of viewing time. Perfect for students, researchers, and busy professionals." />
          <FeatureCard icon={<Globe size={32}/>} title="Universal Support" desc="Works with lectures, tutorials, interviews, presentations, and more for comprehensive needs." />
        </div>
      </section>

      {/* Testimonials */}
      <section id="about" className="section-container">
        <h2 className="section-title">What Our VidioMind Users Say</h2>
        <div className="type-grid">
          <TestimonialCard 
            quote="VidioMind saved me countless hours of research time. I was able to extract key insights from 15 hour-long videos in a single afternoon."
            name="Content Creator" role="Digital Media Specialist"
          />
          <TestimonialCard 
            quote="The summarization feature is incredible! I can now extract key insights from hour-long videos in just minutes. My productivity has increased by at least 70%."
            name="Online Educator" role="E-Learning Platform"
          />
          <TestimonialCard 
            quote="As a busy professional, I don't have time to watch lengthy tutorials. VidioMind has become essential for staying informed while saving 85% of my time."
            name="Marketing Director" role="Technology Company"
          />
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="section-container">
        <h2 style={{fontSize: '2rem', marginBottom: '1rem', textAlign: 'center'}}>Get in Touch</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '3rem', textAlign: 'center'}}>Have questions or ready to get started? Reach out to our team and we'll be happy to help.</p>
        
        <div className="contact-section">
          <form className="contact-form">
            <div className="input-row">
              <div className="input-group">
                <label>Name</label>
                <input type="text" className="dark-input" placeholder="Your name" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="dark-input" placeholder="Your email" />
              </div>
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input type="text" className="dark-input" placeholder="What's this about?" />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea className="dark-input" rows="5" placeholder="Your message"></textarea>
            </div>
            <button type="button" className="btn-primary" style={{width: 'fit-content'}}>Send Message</button>
          </form>

          <div className="contact-info">
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center'}}>
              <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%'}}><Mail color="#3b82f6"/></div>
              <div>
                <h4 style={{margin: 0}}>Email Us</h4>
                <p style={{margin: '5px 0 0 0', color: 'var(--text-muted)'}}>contact@vidiomind.ai</p>
              </div>
            </div>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%'}}><MapPin color="#3b82f6"/></div>
              <div>
                <h4 style={{margin: 0}}>Find Us</h4>
                <p style={{margin: '5px 0 0 0', color: 'var(--text-muted)'}}>We are 100% Online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <a href="#home" className="nav-brand" onClick={(e) => handleScrollToSection(e, 'home')} style={{marginBottom: '1rem', textDecoration: 'none'}}>
              <Youtube color="#3b82f6" size={24} /> VidioMind
            </a>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px'}}>
              VidioMind is your go-to free video summarizer, leveraging cutting-edge AI to deliver instant, 
              concise summaries of millions of videos. Connect with us and explore the power of simplified video understanding!
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#home" onClick={(e) => handleScrollToSection(e, 'home')} style={{textDecoration: 'none'}}>Home</a>
              <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')} style={{textDecoration: 'none'}}>About Us</a>
              <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} style={{textDecoration: 'none'}}>Features</a>
              <a href="#contact" onClick={(e) => handleScrollToSection(e, 'contact')} style={{textDecoration: 'none'}}>Contact</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Our Services</h4>
            <div className="footer-links">
              <Link to={user ? "/dashboard" : "/login"} style={{textDecoration: 'none'}}><Youtube size={14} style={{display:'inline', marginRight:'5px'}}/> YouTube Summarizer</Link>
              <Link to={user ? "/dashboard" : "/login"} style={{textDecoration: 'none'}}><Upload size={14} style={{display:'inline', marginRight:'5px'}}/> Video Upload</Link>
              <Link to={user ? "/dashboard" : "/login"} style={{textDecoration: 'none'}}><FileText size={14} style={{display:'inline', marginRight:'5px'}}/> Blog Generator</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <div className="footer-links">
              <Link to="/privacy" style={{textDecoration: 'none'}}>Terms of Service</Link>
              <Link to="/privacy" style={{textDecoration: 'none'}}>Privacy Policy</Link>
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

export default LandingPage;