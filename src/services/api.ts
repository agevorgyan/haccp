import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Centralized Axios HTTP Client
 * Automatically handles Authorization headers, JWT token injection,
 * standardized response unwrapping ({ success: true, data: payload }),
 * standardized error message extraction, and 401 session expiry.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach JWT Bearer Token reliably for every request
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('haccp_access_token');

    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Seamlessly unwrap standardized responses and handle standardized errors
api.interceptors.response.use(
  (response) => {
    // If backend returns standardized wrapper { success: true, data: payload }, unwrap payload
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      'data' in response.data
    ) {
      const payload = response.data.data;
      // Preserve standard response wrapper on hidden property for components inspecting response metadata
      if (payload && typeof payload === 'object') {
        try {
          Object.defineProperty(payload, '_standardResponse', {
            value: response.data,
            enumerable: false,
            writable: true,
          });
        } catch {
          // ignore
        }
      }
      response.data = payload;
    }
    return response;
  },
  (error) => {
    // Extract standardized backend error message if present
    if (error.response && error.response.data && error.response.data.error) {
      const stdError = error.response.data.error;
      if (stdError.message) {
        error.message = stdError.message;
      }
      if (stdError.code) {
        error.code = stdError.code;
      }
    }

    if (error.response && error.response.status === 401) {
      // Clear token and user session on 401 Unauthorized
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('haccp_access_token');
      localStorage.removeItem('user');

      console.warn('Session expired or unauthorized request (401). Clearing state and redirecting to login.');

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
