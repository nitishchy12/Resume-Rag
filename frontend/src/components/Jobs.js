import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: ''
  });
  const [creating, setCreating] = useState(false);
  const [matching, setMatching] = useState({});
  const [matches, setMatches] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobs();
      setJobs(response.data.results || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const idempotencyKey = `job-${Date.now()}`;
      await jobAPI.createJob(newJob, idempotencyKey);
      
      // Reset form and refresh jobs
      setNewJob({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        salary_range: ''
      });
      setShowCreateForm(false);
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleMatchJob = async (jobId) => {
    setMatching({ ...matching, [jobId]: true });

    try {
      const response = await jobAPI.matchJob(jobId, 10);
      setMatches({ ...matches, [jobId]: response.data.matches });
    } catch (error) {
      console.error('Error matching job:', error);
    } finally {
      setMatching({ ...matching, [jobId]: false });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Job
        </button>
      </div>

      {/* Create Job Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Job</h3>
              
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newJob.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      name="company"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newJob.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Tech Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newJob.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Remote, New York"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                    <input
                      type="text"
                      name="salary_range"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newJob.salary_range}
                      onChange={handleInputChange}
                      placeholder="e.g., $80k - $120k"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Description</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newJob.description}
                    onChange={handleInputChange}
                    placeholder="Describe the role, responsibilities, and company culture..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <textarea
                    name="requirements"
                    required
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newJob.requirements}
                    onChange={handleInputChange}
                    placeholder="List required skills, experience, education..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Job'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-lg text-gray-600">{job.company}</p>
                  {job.location && <p className="text-sm text-gray-500">📍 {job.location}</p>}
                  {job.salary_range && <p className="text-sm text-gray-500">💰 {job.salary_range}</p>}
                </div>
                <button
                  onClick={() => handleMatchJob(job.id)}
                  disabled={matching[job.id]}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {matching[job.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Matching...
                    </>
                  ) : (
                    'Find Matches'
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{job.requirements}</p>
                </div>
              </div>

              {/* Matches */}
              {matches[job.id] && matches[job.id].length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Top Matches ({matches[job.id].length})
                  </h4>
                  <div className="space-y-3">
                    {matches[job.id].slice(0, 5).map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">{match.name}</h5>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {Math.round(match.match_score * 100)}% match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{match.email}</p>
                          {match.matched_skills && match.matched_skills.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              <strong>Skills:</strong> {match.matched_skills.join(', ')}
                            </p>
                          )}
                        </div>
                        <a
                          href={`/candidates/${match.resume_id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <span className="text-6xl mb-4 block">💼</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
          <p className="text-gray-500 mb-4">Create your first job posting to start finding candidates</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Job
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;