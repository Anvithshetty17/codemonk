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
      
      // Don't redirect to login if:
      // 1. Already on login page
      // 2. On home page (/)
      // 3. The failed request was an auth check (/auth/me)
      const currentPath = window.location.pathname;
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      
      if (currentPath !== '/login' && currentPath !== '/' && !isAuthCheck) {
        console.log('API: Unauthorized, redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
