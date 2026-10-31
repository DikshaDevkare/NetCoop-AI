import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor with graceful error envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error
    return Promise.reject(error);
  }
);
