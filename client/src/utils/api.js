import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token from localStorage to Authorization header
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Clear token from localStorage if it exists
      localStorage.removeItem('authToken');
      
      // Only redirect to login if not already on auth page
      if (window.location.pathname !== '/auth') {
        console.log('API: Unauthorized, redirecting to auth');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
