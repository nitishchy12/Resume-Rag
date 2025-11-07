import axios from 'axios';

// Base URL for your Django backend
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Request interceptor to add auth token (skip for resume uploads)
api.interceptors.request.use(
  (config) => {
    if (config.url === '/resumes/' && config.method === 'post') {
      return config; // skip auth for resume uploads
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (original.url === '/resumes/' && original.method === 'post') {
      return Promise.reject(error); // skip resume uploads
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        } catch (refreshError) {
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
  },
};

// Resume API
export const resumeAPI = {
  uploadResume: (formData, idempotencyKey) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    if (idempotencyKey) config.headers['Idempotency-Key'] = idempotencyKey;
    return api.post('/resumes/', formData, config);
  },

  // Automatically return results array from paginated response
  getResumes: async (params = {}) => {
    const res = await api.get('/resumes/', { params });
    return res.data.results; // <- important fix
  },

  getResume: (id) => api.get(`/resumes/${id}/`),

  searchResumes: async (query, limit = 10, offset = 0) => {
    const res = await api.get('/resumes/', {
      params: { q: query, limit, offset },
    });
    return res.data.results; // <- important fix
  },
};

// Job API
export const jobAPI = {
  createJob: (jobData, idempotencyKey) => {
    const config = {};
    if (idempotencyKey) config.headers = { 'Idempotency-Key': idempotencyKey };
    return api.post('/jobs/', jobData, config);
  },

  getJobs: (params = {}) => api.get('/jobs/', { params }),
  getJob: (id) => api.get(`/jobs/${id}/`),
  matchJob: (jobId, topN = 10) => api.post(`/jobs/${jobId}/match/`, { top_n: topN }),
};

// Query API
export const queryAPI = {
  askQuery: (query, k = 5) => api.post('/ask/', { query, k }),
};

export default api;
