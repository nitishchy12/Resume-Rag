import React, { useState } from 'react';
import axios from 'axios';

const DebugUpload = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectUpload = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Create a simple test file
      const testContent = 'John Doe\nSoftware Engineer\nSkills: Python, React, Django';
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', 'Debug Test');
      formData.append('email', 'debug@test.com');

      console.log('Sending request to:', 'http://localhost:8000/api/resumes/');
      
      // Direct axios call without interceptors
      const response = await axios.post('http://localhost:8000/api/resumes/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Response:', response);
      setResult(`✅ Success! Status: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`);

    } catch (error) {
      console.error('Error:', error);
      
      let errorMsg = '❌ Error: ';
      if (error.response) {
        errorMsg += `HTTP ${error.response.status} - ${error.response.statusText}\n`;
        errorMsg += `Response: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.request) {
        errorMsg += `Network error - no response received\n`;
        errorMsg += `Request: ${error.request}`;
      } else {
        errorMsg += `${error.message}`;
      }
      
      setResult(errorMsg);
    }

    setLoading(false);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setResult('Testing backend connection...');

    try {
      const response = await axios.get('http://localhost:8000/', {
        timeout: 5000,
      });

      setResult(`✅ Backend is accessible!\nStatus: ${response.status}\nData: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Backend connection failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Upload</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Backend Connection
        </button>
        
        <button
          onClick={testDirectUpload}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Direct Upload
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">
          {loading ? 'Loading...' : result || 'Click a button to test'}
        </pre>
      </div>
    </div>
  );
};

export default DebugUpload;