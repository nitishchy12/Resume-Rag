import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, queryAPI } from '../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('ask'); // 'ask' or 'filter'
  const [allResumes, setAllResumes] = useState([]);

  useEffect(() => {
    // Load all resumes for filter search
    fetchAllResumes();
  }, []);

  const fetchAllResumes = async () => {
    try {
      const response = await resumeAPI.getResumes();
      setAllResumes(response.data.results || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      if (searchType === 'ask') {
        // Use AI-powered query
        const response = await queryAPI.askQuery(query, 10);
        setResults(response.data.results || []);
      } else {
        // Use simple filter search
        const response = await resumeAPI.searchResumes(query);
        const formatted = response.data.results.map(resume => ({
          resume_id: resume.id,
          name: resume.name,
          email: resume.email,
          similarity_score: 1.0,
          matched_skills: resume.skills,
          evidence_snippets: []
        }));
        setResults(formatted);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Candidates</h1>

      {/* Search Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col space-y-4">
          {/* Search Type Toggle */}
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="searchType"
                value="ask"
                checked={searchType === 'ask'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">AI-Powered Query</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="searchType"
                value="filter"
                checked={searchType === 'filter'}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Basic Filter</span>
            </label>
          </div>

          {/* Search Input */}
          <div className="flex space-x-4">
            <input
              type="text"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={
                searchType === 'ask' 
                  ? "e.g., 'Who has React and Django experience with 3+ years?'" 
                  : "Search by name, email, skills..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Type Explanation */}
          <div className="text-sm text-gray-500">
            {searchType === 'ask' ? (
              <p>💡 Use natural language queries like "Find Python developers with machine learning experience"</p>
            ) : (
              <p>💡 Search by keywords in name, email, skills, or resume content</p>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Search Results ({results.length} found)
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{result.name}</h4>
                        {searchType === 'ask' && result.similarity_score && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Math.round(result.similarity_score * 100)}% match
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{result.email}</p>
                      
                      {result.matched_skills && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            <strong>Skills:</strong> {result.matched_skills}
                          </p>
                        </div>
                      )}
                      
                      {result.evidence_snippets && result.evidence_snippets.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Evidence:</p>
                          <div className="space-y-2">
                            {result.evidence_snippets.map((snippet, snippetIndex) => (
                              <div key={snippetIndex} className="bg-yellow-50 border-l-4 border-yellow-400 p-2">
                                <p className="text-sm text-gray-700 italic">{snippet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <Link
                        to={`/candidates/${result.resume_id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && query && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="text-gray-500">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-sm">Try adjusting your search query or search type</p>
          </div>
        </div>
      )}

      {/* All Resumes Preview */}
      {allResumes.length > 0 && !query && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              All Candidates ({allResumes.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allResumes.slice(0, 9).map((resume) => (
                <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{resume.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{resume.email}</p>
                  {resume.skills && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{resume.skills}</p>
                  )}
                  <Link
                    to={`/candidates/${resume.id}`}
                    className="text-xs text-blue-600 hover:text-blue-900"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
            {allResumes.length > 9 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 9 of {allResumes.length} candidates. Use search to find specific candidates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered Queries:</h4>
            <ul className="space-y-1">
              <li>• "Find developers with Python and machine learning"</li>
              <li>• "Who has 5+ years experience in React?"</li>
              <li>• "Show me candidates with data science background"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Filter:</h4>
            <ul className="space-y-1">
              <li>• Search by candidate name or email</li>
              <li>• Filter by specific skills or technologies</li>
              <li>• Use keywords from resume content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;