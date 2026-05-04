import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages Import
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FeaturesPage from './pages/FeaturesPage'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import ResultPage from './pages/ResultPage';
import VideoRagPage from './pages/VideoRagPage';
import Documentation from './components/Documentation';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/features" element={<FeaturesPage />} /> 
        <Route path="/login" element={<Login />} />
        
        {/* In routes ke andar Layout component hai */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/video-rag" element={<VideoRagPage />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/summary" element={<ResultPage activeTab="summary" />} />
        <Route path="/blog" element={<ResultPage activeTab="blog" />} />
        <Route path="/export" element={<ResultPage activeTab="export" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;