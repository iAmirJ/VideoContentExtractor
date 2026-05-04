import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import Layout from '../components/Layout';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(""); // Success message dikhane ke liye
  
  const userId = localStorage.getItem("user_id") || 1; // Backend ke liye ID

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "",
    joinedDate: "",
    plan: "Free",
    videosAnalyzed: 0,
    exportsCreated: 0
  });

  // 1. PAGE LOAD HOTAY HI DATABASE SE DATA LAO
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/profile/${userId}`);
        setProfileData(res.data);
      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // 2. SAVE BUTTON PAR DATABASE MEIN UPDATE KARO
  const handleSave = async () => {
    try {
      setSaveStatus("Saving...");
      // Backend par updated data bhejein
      await axios.put(`${API_BASE_URL}/profile/${userId}`, {
        full_name: profileData.fullName, // Backend key names se match kiya hai
        email: profileData.email,
        role: profileData.role
      });
      
      setSaveStatus("Saved successfully!");
      setTimeout(() => {
        setSaveStatus("");
        setIsEditing(false); // Wapis Stats view mein jao
      }, 1500);

    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("Error saving profile");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U"; // User ka initial
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ padding: "40px", color: "#a855f7" }}>Loading profile data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "32px 40px", width: "100%", maxWidth: "1100px", boxSizing: "border-box", margin: "0 auto" }}>
        
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span>👤</span> My Profile
        </div>

        {/* TOP CARD: User Basic Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px 30px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 600, color: '#fff', letterSpacing: '1px' }}>
              {getInitials(profileData.fullName)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                {profileData.fullName || "User"}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>
                <div>{profileData.role || "No Role Defined"}</div>
                <div>Joined {profileData.joinedDate} • {profileData.plan} Plan</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            {isEditing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>

        {/* CONDITIONAL RENDERING */}
        {!isEditing ? (
          /* VIEW MODE: Stats */
          <div style={{ background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px 30px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Account Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 600, color: '#a855f7', marginBottom: '8px' }}>{profileData.videosAnalyzed}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Videos Analyzed</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 600, color: '#a855f7', marginBottom: '8px' }}>{profileData.exportsCreated}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Exports Created</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 600, color: '#a855f7', marginBottom: '8px' }}>{profileData.plan}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Plan</div>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE: Form */
          <div style={{ background: '#151521', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px 30px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>Edit Profile</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>Full Name</label>
                <input type="text" name="fullName" value={profileData.fullName} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', fontSize: '14px', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>Email</label>
                <input type="email" name="email" value={profileData.email} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', fontSize: '14px', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>Role / Department</label>
                <input type="text" name="role" value={profileData.role} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', fontSize: '14px', background: '#0b0b14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={handleSave}
                  disabled={saveStatus === "Saving..."}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: saveStatus === "Saving..." ? 0.7 : 1 }}
                >
                  {saveStatus === "Saving..." ? "Saving..." : "Save Changes"}
                </button>
                {saveStatus && saveStatus !== "Saving..." && (
                  <span style={{ fontSize: '13px', color: saveStatus.includes("Error") ? "#f87171" : "#34d399" }}>{saveStatus}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;