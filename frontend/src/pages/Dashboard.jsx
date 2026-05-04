import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config'; 
import Layout from '../components/Layout';

const Dashboard = () => {
  const [link, setLink] = useState('');
  const [shortSeconds, setShortSeconds] = useState(0); 
  const [step, setStep] = useState('idle'); 
  const [pipeStep, setPipeStep] = useState(0);
  const [result, setResult] = useState({}); 
  const [activeTab, setActiveTab] = useState('summary');
  const [exportMsg, setExportMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const location = useLocation();
  React.useEffect(() => {
    if (location.state && location.state.prefillUrl) {
      setLink(location.state.prefillUrl); // Input field ko URL assign kar diya
    }
  }, [location]);
  
  // Video status mein 'waiting' ka naya state add kiya hai
  const [videoStatus, setVideoStatus] = useState('idle'); // idle | waiting | processing | completed | error

  const pipes = [
    "Extracting video ID...", 
    "Fetching transcript...", 
    "Running AI processing...", 
    "Finalizing content..."
  ];

  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${base}${url}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Video URL copied to clipboard!');
  };

  // ==========================================
  // NAYI LOGIC: Start Video Processing AFTER Summary
  // ==========================================
  const startVideoShortening = async (videoUrl, uId, duration) => {
    setVideoStatus('processing'); // Ab video processing show hoga
    try {
      const vidRes = await axios.post(`${API_BASE_URL}/shorten-video`, {
        url: videoUrl,
        user_id: uId,
        target_duration: duration
      });
      pollShortStatus(vidRes.data.request_id);
    } catch (err) {
      console.error('Video shorten error', err);
      setVideoStatus('error');
    }
  };

  // ==========================================
  // 1. API LOGIC: GENERATE SUMMARY FIRST
  // ==========================================
  const handleGenerate = async () => {
    if (!link) return alert("Please paste a valid YouTube URL!");
    
    setStep('loading');
    setPipeStep(1);
    setResult({});
    
    // Video ko 'waiting' state mein daal do taake CPU pehle summary banaye
    setVideoStatus(shortSeconds > 0 ? 'waiting' : 'idle');

    const userId = parseInt(localStorage.getItem("user_id")) || 1; 

    // PEHLE SIRF SUMMARY KI REQUEST JAYEGI
    try {
      const sumRes = await axios.post(`${API_BASE_URL}/summarize?url=${encodeURIComponent(link)}&user_id=${userId}`);
      pollStatus(sumRes.data.project_id, link, userId);
    } catch (err) {
      console.error('Summary generate error', err);
      setStep('error');
    }
  };

  // Polling for Text Summary
  const pollStatus = (id, currentLink, uId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status/${id}`);
        
        if (res.data.status === 'Transcribing') setPipeStep(2);
        if (res.data.status === 'Processing') setPipeStep(3);

        if (res.data.status === 'Completed') {
          clearInterval(interval);
          setPipeStep(4);
          setTimeout(() => {
            setResult(prev => ({
              ...prev,
              title: res.data.title || "Video Analysis Complete", 
              summary: res.data.summary,
              blog: res.data.blog,
              keyPoints: res.data.keyPoints || ["Detailed analysis completed."],
              keywords: res.data.keywords || ["AI", "Summary", "VidioMind"]
            }));
            setStep('done');
            setActiveTab('summary'); 

            // ⭐ JAISE HI SUMMARY SHOW HO, USKE FORAN BAAD VIDEO SHORTENER START KARO
            if (shortSeconds > 0) {
              startVideoShortening(currentLink, uId, shortSeconds);
            }
          }, 500); 
        }
      } catch (err) {
        console.error('pollStatus error', err);
        clearInterval(interval);
        setStep('error');
      }
    }, 2000);
  };

  // Polling for Short Video
  const pollShortStatus = (reqId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/shorten-status/${reqId}`);
        
        if (res.data.status === 'completed') {
          clearInterval(interval);
          setVideoStatus('completed');
          setResult(prev => ({
            ...prev,
            shortVideo: res.data.url 
          }));
        } else if (res.data.status === 'error') {
          clearInterval(interval);
          setVideoStatus('error');
        }
      } catch (err) {
        console.error('pollShortStatus error', err);
        clearInterval(interval);
        setVideoStatus('error');
      }
    }, 3000); 
  };

  // ==========================================
  // 2. API LOGIC: EXPORT FILES
  // ==========================================
  const flash = (msg) => { setExportMsg(msg); setTimeout(() => setExportMsg(""), 3000); };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const combinedContent = `SUMMARY:\n${result.summary}\n\nBLOG POST:\n${result.blog}`;
      const response = await axios.post(`${API_BASE_URL}/export/${format}`, {
        title: result.title || "VidioMind Summary", 
        content: combinedContent
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const linkElement = document.createElement('a');
      linkElement.href = url;
      let extension = format === 'word' ? 'docx' : format === 'ppt' ? 'pptx' : 'pdf';
      linkElement.setAttribute('download', `VidioMind_Export.${extension}`);
      document.body.appendChild(linkElement);
      linkElement.click();
      linkElement.parentNode.removeChild(linkElement);
      window.URL.revokeObjectURL(url);
      
      flash(`${format.toUpperCase()} successfully exported!`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export generate karne mein masla aaya!");
    } finally {
      setExporting(false);
    }
  };

  const tabBtn = (t, icon, label) => {
    const isActive = activeTab === t;
    return (
      <button 
        onClick={() => setActiveTab(t)} 
        style={{ 
          flex: 1, padding: "12px 0", fontSize: "13px", cursor: "pointer", borderRadius: 8, 
          background: isActive ? "#2d1b69" : "transparent", color: isActive ? "#e9d5ff" : "rgba(255,255,255,0.45)", 
          fontWeight: isActive ? 500 : 400, border: "none", transition: "all 0.2s"
        }}
      >
        {icon} <span style={{ marginLeft: 6 }}>{label}</span>
      </button>
    );
  };

  return (
    <Layout>
      <div style={{ padding: "32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", color: "#fff" }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚡</span> Analyze Video
          </div>

          {/* INPUT AREA */}
          <div style={{ background: "#151521", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>YouTube Video URL</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && handleGenerate()} 
                placeholder="https://youtu.be/..." 
                style={{ flex: 1, minWidth: "250px", padding: "14px 16px", fontSize: 14, background: "#0b0b14", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, color: "#fff", outline: "none" }} 
              />
              <select 
                value={shortSeconds} 
                onChange={e => setShortSeconds(Number(e.target.value))}
                style={{ padding: "0 16px", fontSize: 14, background: "#0b0b14", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, color: "#fff", outline: "none", cursor: "pointer" }}
              >
                <option value={0}>No Short (Skip)</option>
                <option value={30}>30 Sec Short</option>
                <option value={60}>1 Min Short</option>
                <option value={90}>1.5 Min Short</option>
                <option value={120}>2 Min Short</option>
              </select>
              <button 
                onClick={handleGenerate} 
                disabled={step === 'loading'} 
                style={{ padding: "0 24px", height: "48px", background: step === 'loading' ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "none", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: step === 'loading' ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                {step === 'loading' ? "⏳ Processing..." : "⚡ Analyze"}
              </button>
            </div>
          </div>

          {/* LOADER PIPELINE */}
          {step === 'loading' && (
            <div style={{ background: "#151521", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>AI Processing Pipeline</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pipes.map((p, i) => {
                  const isDone = pipeStep > i + 1;
                  const isActive = pipeStep === i + 1;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: isDone ? "#34d399" : isActive ? "#a855f7" : "#374151", boxShadow: isActive ? "0 0 10px rgba(168,85,247,0.6)" : "none" }} />
                      <div style={{ fontSize: 14, color: isDone ? "#6ee7b7" : isActive ? "#d8b4fe" : "#6b7280" }}>{isActive ? `⏳ ${p}` : p}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'error' && (
             <div style={{ background: "rgba(220,38,38,0.1)", border: `1px solid rgba(220,38,38,0.3)`, borderRadius: 12, padding: 20, color: "#f87171", fontSize: 14 }}>
               ❌ Server error. Check your FastAPI backend and the URL.
             </div>
          )}

          {/* RESULTS TABS */}
          {step === 'done' && (
            <div style={{ background: "#151521", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 20 }}>{result.title}</div>
              
              <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 6, marginBottom: 24, gap: 4 }}>
                {tabBtn("summary", "📄", "Summary")}
                {tabBtn("blog", "📝", "Blog")}
                {tabBtn("short", "🎬", "Short Video")}
                {tabBtn("export", "📤", "Export")}
              </div>

              {/* TAB 1: SUMMARY */}
              {activeTab === "summary" && (
                <div style={{ padding: "0 8px" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-line" }}>{result.summary}</p>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12, fontWeight: 500 }}>Key Points</div>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {result.keyPoints?.map((p,i) => <li key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 10, lineHeight: 1.6 }}>{p}</li>)}
                  </ul>
                </div>
              )}

              {/* TAB 2: BLOG */}
              {activeTab === "blog" && (
                <div style={{ padding: "0 8px", fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                  {result.blog}
                </div>
              )}

              {/* TAB 3: SHORT VIDEO */}
              {activeTab === "short" && (
                <div style={{ padding: "0 8px" }}>
                  
                  {/* NAYI WAITING STATE */}
                  {videoStatus === 'waiting' && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#a855f7", background: "rgba(168,85,247,0.1)", borderRadius: 12, border: "1px solid rgba(168,85,247,0.3)" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>⏱️</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>Waiting to start...</div>
                      <div style={{ fontSize: 13, marginTop: 4, color: "rgba(255,255,255,0.6)" }}>To ensure maximum speed, the AI will start generating the short video immediately after the text analysis is completely done.</div>
                    </div>
                  )}

                  {videoStatus === 'processing' && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#a855f7", background: "rgba(168,85,247,0.1)", borderRadius: 12, border: "1px solid rgba(168,85,247,0.3)" }}>
                      <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 2s linear infinite" }}>⏳</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>AI is generating your short video...</div>
                      <div style={{ fontSize: 13, marginTop: 4, color: "rgba(255,255,255,0.6)" }}>Downloading, transcribing, and rendering. This may take a few minutes.</div>
                    </div>
                  )}

                  {videoStatus === 'error' && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#f87171", background: "rgba(248,113,113,0.1)", borderRadius: 12, border: "1px solid rgba(248,113,113,0.3)" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>Failed to generate short video.</div>
                      <div style={{ fontSize: 13, marginTop: 4, color: "rgba(255,255,255,0.6)" }}>Please check your backend terminal for errors.</div>
                    </div>
                  )}

                  {videoStatus === 'idle' && (
                    <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                      <div style={{ fontSize: 15 }}>No short video requested.</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>You selected "No Short (Skip)" before analyzing.</div>
                    </div>
                  )}

                  {videoStatus === 'completed' && result.shortVideo && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 14, color: "#34d399", fontWeight: 500 }}>✅ AI Generated Short Video Ready</div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => copyToClipboard(resolveUrl(result.shortVideo))} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13 }}>🔗 Copy URL</button>
                          <a href={resolveUrl(result.shortVideo)} download target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 8, color: "#d8b4fe", textDecoration: "none", fontSize: 13 }}>⬇️ Download</a>
                        </div>
                      </div>
                      <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid rgba(255,255,255,0.08)`, background: "#000" }}>
                        <video src={resolveUrl(result.shortVideo)} controls preload="metadata" crossOrigin="anonymous" style={{ width: "100%", maxHeight: "500px", display: "block" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EXPORT */}
              {activeTab === "export" && (
                <div style={{ padding: "0 8px" }}>
                  {exportMsg && <div style={{ background: "rgba(16,185,129,0.08)", border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#34d399" }}>✅ {exportMsg}</div>}
                  {exporting && <div style={{ marginBottom: 16, color: "#a855f7", fontSize: 14 }}>⏳ Generating your file from server...</div>}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <button onClick={() => handleExport('pdf')} disabled={exporting} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "24px", textAlign: "center", cursor: exporting ? "not-allowed" : "pointer", color: "#fff", transition: "background 0.2s" }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div><div style={{ fontSize: 15, fontWeight: 500 }}>Export PDF</div>
                    </button>
                    <button onClick={() => handleExport('ppt')} disabled={exporting} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "24px", textAlign: "center", cursor: exporting ? "not-allowed" : "pointer", color: "#fff", transition: "background 0.2s" }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div><div style={{ fontSize: 15, fontWeight: 500 }}>Export PPT</div>
                    </button>
                    <button onClick={() => handleExport('word')} disabled={exporting} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "24px", textAlign: "center", cursor: exporting ? "not-allowed" : "pointer", color: "#fff", transition: "background 0.2s" }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>📝</div><div style={{ fontSize: 15, fontWeight: 500 }}>Export Word</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;