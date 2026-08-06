import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Centralized Axios HTTP Client
 * Automatically handles Authorization headers, token injection, and 401 session expiry redirects.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user session on 401 Unauthorized
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch event or window reload if unauthenticated
      console.warn('Session expired or unauthorized request. Session cleared.');
    }
    return Promise.reject(error);
  }
);

export default api;
