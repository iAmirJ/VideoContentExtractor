import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Importing Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/summary" element={<ResultPage activeTab="summary" />} />
        <Route path="/blog" element={<ResultPage activeTab="blog" />} />
        <Route path="/export" element={<ResultPage activeTab="export" />} />
      </Routes>
    </Router>
  );
}

export default App;