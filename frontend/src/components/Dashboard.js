import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, jobAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalJobs: 0,
    recentResumes: [],
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch resumes and jobs
      const [resumesResponse, jobsResponse] = await Promise.all([
        resumeAPI.getResumes({ limit: 5 }),
        jobAPI.getJobs({ limit: 5 })
      ]);

      setStats({
        totalResumes: resumesResponse.data.count || resumesResponse.data.results?.length || 0,
        totalJobs: jobsResponse.data.count || jobsResponse.data.results?.length || 0,
        recentResumes: resumesResponse.data.results || [],
        recentJobs: jobsResponse.data.results || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📄</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Resumes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalResumes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💼</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔍</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Search Ready</dt>
                  <dd className="text-lg font-medium text-gray-900">Yes</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚡</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Matching</dt>
                  <dd className="text-lg font-medium text-gray-900">Active</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          to="/upload"
          className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
              <span className="text-2xl">📤</span>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Resumes
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload PDF or DOCX resume files for parsing and analysis
            </p>
          </div>
        </Link>

        <Link
          to="/search"
          className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
              <span className="text-2xl">🔎</span>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Search Candidates
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Find candidates using natural language queries
            </p>
          </div>
        </Link>

        <Link
          to="/jobs"
          className="relative group bg-white p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
              <span className="text-2xl">💼</span>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Job Matching
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create jobs and find matching candidates automatically
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Resumes</h3>
            {stats.recentResumes.length > 0 ? (
              <div className="space-y-3">
                {stats.recentResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                      <p className="text-sm text-gray-500">{resume.email}</p>
                    </div>
                    <Link
                      to={`/candidates/${resume.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No resumes uploaded yet</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Jobs</h3>
            {stats.recentJobs.length > 0 ? (
              <div className="space-y-3">
                {stats.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                    <Link
                      to={`/jobs`}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No jobs created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;