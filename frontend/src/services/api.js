import axios from 'axios';

// Base URL for your Django backend
const BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Request interceptor to add auth token (skip for resume uploads)
api.interceptors.request.use(
  (config) => {
    // Skip authentication for resume uploads to allow anonymous uploads
    if (config.url === '/resumes/' && config.method === 'post') {
      return config;
    }
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    // Skip token refresh for resume uploads (allow anonymous)
    if (original.url === '/resumes/' && original.method === 'post') {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          original.headers.Authorization = `Bearer ${access}`;
          
          return api(original);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Resume API
export const resumeAPI = {
  uploadResume: (formData, idempotencyKey) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    
    if (idempotencyKey) {
      config.headers['Idempotency-Key'] = idempotencyKey;
    }
    
    return api.post('/resumes/', formData, config);
  },
  
  getResumes: (params = {}) => {
    return api.get('/resumes/', { params });
  },
  
  getResume: (id) => api.get(`/resumes/${id}/`),
  
  searchResumes: (query, limit = 10, offset = 0) => {
    return api.get('/resumes/', {
      params: { q: query, limit, offset }
    });
  }
};

// Job API
export const jobAPI = {
  createJob: (jobData, idempotencyKey) => {
    const config = {};
    if (idempotencyKey) {
      config.headers = { 'Idempotency-Key': idempotencyKey };
    }
    return api.post('/jobs/', jobData, config);
  },
  
  getJobs: (params = {}) => api.get('/jobs/', { params }),
  
  getJob: (id) => api.get(`/jobs/${id}/`),
  
  matchJob: (jobId, topN = 10) => {
    return api.post(`/jobs/${jobId}/match/`, { top_n: topN });
  }
};

// Query API
export const queryAPI = {
  askQuery: (query, k = 5) => {
    return api.post('/ask/', { query, k });
  }
};

export default api;