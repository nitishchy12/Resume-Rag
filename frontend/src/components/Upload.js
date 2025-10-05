import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFiles) => {
    const fileList = Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx')
    );
    
    setFiles(prev => [...prev, ...fileList]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadResults([]);
    
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.split('.')[0].replace(/[^a-zA-Z0-9\s]/g, ' ')); // Clean filename
      formData.append('email', `user${Date.now()}@example.com`); // Temporary email
      formData.append('phone', ''); // Optional
      
      try {
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);
        
        // Direct API call to Django backend
        const response = await axios.post('http://localhost:8000/api/resumes/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000
        });
        
        console.log('Upload successful:', response.data);
        
        results.push({
          file: file.name,
          status: 'success',
          message: 'Uploaded successfully',
          data: response.data
        });
      } catch (error) {
        console.error('Upload error:', error);
        
        let errorMessage = 'Upload failed';
        if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        results.push({
          file: file.name,
          status: 'error',
          message: errorMessage
        });
      }
    }
    
    setUploadResults(results);
    setUploading(false);
    setFiles([]); // Clear files after upload
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Resumes</h1>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop resume files here, or{' '}
                  <span className="text-blue-600 hover:text-blue-500">browse</span>
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOCX up to 10MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files ({files.length})</h3>
          <div className="bg-white shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {file.name.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} Resume${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h3>
          <div className="bg-white shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {uploadResults.map((result, index) => (
                <li key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status === 'success' ? '✓ Success' : '✗ Error'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{result.file}</p>
                        <p className="text-sm text-gray-500">{result.message}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload PDF or DOCX resume files</li>
          <li>• Files are automatically parsed to extract text and skills</li>
          <li>• Supported formats: PDF, Microsoft Word (.docx)</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Multiple files can be uploaded at once</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;