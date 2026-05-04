import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, BookOpen, Share2, Download, Loader2, FileType, Presentation } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';
import Layout from '../components/Layout';

const TabBtn = ({active, onClick, icon, label}) => (
  <button onClick={onClick} style={{
    display:'flex', gap:'8px', alignItems:'center', padding:'12px 20px', 
    background: active ? 'var(--bg-card)' : 'transparent', 
    border:'1px solid transparent', 
    borderBottom: active ? '2px solid var(--primary)' : 'none', 
    color: active ? 'var(--primary)' : 'var(--text-muted)', 
    fontWeight:600, cursor: 'pointer', transition: 'all 0.3s ease'
  }}>
    {icon} {label}
  </button>
);

const ExportCard = ({icon, title, onClick}) => (
  <div className="export-card-hover" style={{
    border:'1px solid var(--border-color)', padding:'25px 20px', 
    borderRadius:'10px', width:'130px', cursor:'pointer', 
    transition: 'all 0.2s', background: 'var(--bg-main)'
  }} onClick={onClick}>
    <div style={{marginBottom:'15px', display:'flex', justifyContent:'center'}}>{icon}</div>
    <strong style={{color: 'var(--text-primary)'}}>{title}</strong>
  </div>
);

const ResultPage = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exporting, setExporting] = useState(false);
  
  // BUG FIXED: Ab yeh sabse pehle nayi history state check karega
  const summaryText = location.state?.summaryData || localStorage.getItem("savedSummary") || "No summary available.";
  const blogText = location.state?.blogData || localStorage.getItem("savedBlog") || "No blog generated.";

  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([summaryText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const combinedContent = `SUMMARY:\n${summaryText}\n\nBLOG POST:\n${blogText}`;
      const response = await axios.post(`${API_BASE_URL}/export/${format}`, {
        title: "VidioMind Summary", content: combinedContent
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      let extension = format === 'word' ? 'docx' : format === 'ppt' ? 'pptx' : 'pdf';
      link.setAttribute('download', `VidioMind_Export.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export generate karne mein masla aaya!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '900px', margin: '30px auto' }}>
        
        <div className="card" style={{ padding: '20px', display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px' }}>
            <div style={{width:'60px', height:'60px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <FileText size={30} color="var(--primary)"/>
            </div>
            <div>
                <h2 style={{margin:0, color: 'var(--text-primary)'}}>Generation Complete</h2>
                <p style={{margin:0, color:'var(--text-muted)'}}>Success! Your content is ready below.</p>
            </div>
        </div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'0', borderBottom:'1px solid var(--border-color)' }}>
            <TabBtn active={activeTab==='summary'} onClick={()=>navigate('/summary', {state:location.state})} icon={<FileText size={16}/>} label="Summary" />
            <TabBtn active={activeTab==='blog'} onClick={()=>navigate('/blog', {state:location.state})} icon={<BookOpen size={16}/>} label="Blog Post" />
            <TabBtn active={activeTab==='export'} onClick={()=>navigate('/export', {state:location.state})} icon={<Share2 size={16}/>} label="Export" />
        </div>

        <div className="card" style={{ borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '30px', minHeight: '400px' }}>
            
            {activeTab === 'summary' && (
                <div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                        <h3 style={{color: 'var(--text-primary)'}}>Video Summary</h3>
                        <button className="btn-primary" onClick={handleDownloadText} style={{fontSize:'13px', padding:'8px 15px'}}><Download size={16} style={{marginRight:'5px'}}/> Download Text</button>
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      {summaryText}
                    </div>
                </div>
            )}
            
            {activeTab === 'blog' && (
                <div>
                    <h3 style={{marginBottom:'20px', color:'var(--text-primary)'}}>Generated Blog Post</h3>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        {blogText}
                    </div>
                </div>
            )}

            {activeTab === 'export' && (
                <div style={{textAlign:'center', paddingTop:'50px'}}>
                    <h3 style={{color: 'var(--text-primary)'}}>Export Options</h3>
                    {exporting && <p style={{color: 'var(--primary)', marginTop: '10px'}}><Loader2 className="spin" size={16} style={{display:'inline', verticalAlign:'middle'}}/> Generating your file...</p>}
                    <div style={{display:'flex', justifyContent:'center', gap:'20px', marginTop:'30px'}}>
                        <ExportCard onClick={() => handleExport('pdf')} icon={<FileText color="#ef4444" size={30}/>} title="PDF" />
                        <ExportCard onClick={() => handleExport('word')} icon={<FileType color="#2563eb" size={30}/>} title="Word" />
                        <ExportCard onClick={() => handleExport('ppt')} icon={<Presentation color="#d97706" size={30}/>} title="PPT" />
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default ResultPage;