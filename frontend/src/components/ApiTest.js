import React, { useState } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Basic backend connection
    try {
      const response = await axios.get('http://localhost:8000/');
      results.backend = { success: true, data: response.data };
    } catch (error) {
      results.backend = { success: false, error: error.message };
    }

    // Test 2: Login endpoint
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username: 'admin',
        password: 'admin123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      results.login = { success: true, data: response.data };
    } catch (error) {
      results.login = { success: false, error: error.message, details: error.response?.data };
    }

    // Test 3: CORS preflight
    try {
      const response = await axios.options('http://localhost:8000/api/auth/login/');
      results.cors = { success: true, headers: response.headers };
    } catch (error) {
      results.cors = { success: false, error: error.message };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Test API Connection'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {testName} Test
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTest;