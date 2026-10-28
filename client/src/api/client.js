import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/me');
      if (!isAuthUrl) {
        localStorage.removeItem('staffsync_token');
        localStorage.removeItem('staffsync_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

