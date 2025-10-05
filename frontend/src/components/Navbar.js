import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const Navbar = ({ setIsAuthenticated }) => {
  const location = useLocation();

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-700';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center px-4 text-lg font-semibold text-gray-900">
              ResumeRAG
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/upload"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/upload')}`}
              >
                Upload Resumes
              </Link>
              
              <Link
                to="/search"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/search')}`}
              >
                Search
              </Link>
              
              <Link
                to="/jobs"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/jobs')}`}
              >
                Jobs
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;