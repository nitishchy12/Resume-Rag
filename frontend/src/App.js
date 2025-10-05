import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Search from './components/Search';
import Jobs from './components/Jobs';
import CandidateDetail from './components/CandidateDetail';
import ApiTest from './components/ApiTest';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/upload" 
            element={isAuthenticated ? <Upload /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/search" 
            element={isAuthenticated ? <Search /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/jobs" 
            element={isAuthenticated ? <Jobs /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/candidates/:id" 
            element={isAuthenticated ? <CandidateDetail /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/api-test" 
            element={<ApiTest />} 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
