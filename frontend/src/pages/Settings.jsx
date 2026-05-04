import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Settings = () => {
  // LocalStorage se initial data uthane ke liye logic
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      darkMode: true,
      autoExport: false,
      outputLanguage: 'English',
      summaryQuality: 'Balanced'
    };
  });

  const [saveStatus, setSaveStatus] = useState("");

  // Toggle handlers
  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setChoice = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Settings Save karne ka function
  const handleSaveSettings = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    setSaveStatus("Settings saved successfully!");
    
    // 2 second baad message remove karne ke liye
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Reusable Switch Component
  const Switch = ({ isOn, handleToggle }) => (
    <div 
      onClick={handleToggle}
      style={{
        width: '44px', height: '22px', borderRadius: '12px',
        background: isOn ? '#7c3aed' : '#3f3f46',
        position: 'relative', cursor: 'pointer', transition: '0.3s'
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', position: 'absolute', top: '2px',
        left: isOn ? '24px' : '2px', transition: '0.3s'
      }} />
    </div>
  );

  // Reusable Choice Chip Component
  const Chip = ({ label, active, onClick }) => (
    <button 
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: '8px', border: '1px solid',
        borderColor: active ? '#7c3aed' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.05)',
        color: active ? '#d8b4fe' : 'rgba(255,255,255,0.6)',
        fontSize: '13px', cursor: 'pointer', transition: '0.2s', fontWeight: active ? '600' : '400'
      }}
    >
      {label}
    </button>
  );

  return (
    <Layout>
      {/* CENTERING WRAPPER START */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        width: '100%', 
        minHeight: '100vh',
        padding: "32px 40px", // Padding adjusted to match Profile/History
        boxSizing: 'border-box'
      }}>
        
        {/* MAIN CONTENT BOX (Max Width ko 1100px kar diya hy Profile aur History ki tarah) */}
        <div style={{ width: "100%", maxWidth: "1100px", color: '#fff' }}>
          
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚙️</span> Settings
          </div>

          {/* Section 1: Preferences */}
          <div style={{ background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>Preferences</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Email Notifications</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Get notified when analysis completes</div>
                </div>
                <Switch isOn={preferences.emailNotifications} handleToggle={() => togglePreference('emailNotifications')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Dark Mode</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Always on for this platform</div>
                </div>
                <Switch isOn={preferences.darkMode} handleToggle={() => togglePreference('darkMode')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Auto-export PDF</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Automatically export after each analysis</div>
                </div>
                <Switch isOn={preferences.autoExport} handleToggle={() => togglePreference('autoExport')} />
              </div>
            </div>
          </div>

          {/* Section 2: Output Settings */}
          <div style={{ background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>Output Settings</div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>Output Language</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['English', 'Urdu', 'Arabic', 'French'].map(lang => (
                  <Chip key={lang} label={lang} active={preferences.outputLanguage === lang} onClick={() => setChoice('outputLanguage', lang)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>Summary Quality</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Fast', 'Balanced', 'High'].map(q => (
                  <Chip key={q} label={q} active={preferences.summaryQuality === q} onClick={() => setChoice('summaryQuality', q)} />
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Account */}
          <div style={{ background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>Account</div>
            <button 
              onClick={handleSignOut}
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', 
                fontWeight: 500, cursor: 'pointer' 
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Footer Save Button with Status Message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
            {saveStatus && <span style={{ color: '#34d399', fontSize: '13px' }}>{saveStatus}</span>}
            <button 
              onClick={handleSaveSettings}
              style={{ 
                background: '#7c3aed', color: '#fff', border: 'none', 
                padding: '12px 24px', borderRadius: '8px', fontWeight: 600, 
                cursor: 'pointer', fontSize: '14px' 
              }}
            >
              Save Settings
            </button>
          </div>

        </div>
        {/* MAIN CONTENT BOX END */}
        
      </div>
      {/* CENTERING WRAPPER END */}
    </Layout>
  );
};

export default Settings;