import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../services/api';

const CandidateDetail = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResume(id);
      setResume(response.data);
    } catch (error) {
      console.error('Error fetching resume:', error);
      setError('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Candidate not found'}
          </h3>
          <Link
            to="/search"
            className="text-blue-600 hover:text-blue-900"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/search"
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Search
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Candidate Header */}
        <div className="px-6 py-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {resume.name ? resume.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{resume.name}</h1>
              <p className="text-lg text-gray-600">{resume.email}</p>
              {resume.phone && (
                <p className="text-sm text-gray-500">📞 {resume.phone}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                📅 Uploaded on {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Skills */}
          {resume.skills && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {resume.experience && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
              <p className="text-gray-700 whitespace-pre-line">{resume.experience}</p>
            </div>
          )}

          {/* Education */}
          {resume.education && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              <p className="text-gray-700 whitespace-pre-line">{resume.education}</p>
            </div>
          )}

          {/* Resume Content */}
          {resume.extracted_text && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resume Content
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {resume.extracted_text}
                </pre>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Information</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">File Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {resume.file ? resume.file.split('/').pop() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(resume.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(resume.updated_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {resume.uploaded_by?.username || 'System'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="border-t pt-6">
            <div className="flex space-x-4">
              {resume.file && (
                <a
                  href={resume.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  📄 Download Resume
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/search?q=${encodeURIComponent(resume.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Find Similar Candidates
          </Link>
          {resume.skills && resume.skills.split(',').slice(0, 3).map((skill, index) => (
            <Link
              key={index}
              to={`/search?q=${encodeURIComponent(skill.trim())}`}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Find {skill.trim()} experts
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;