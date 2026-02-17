import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  // Use the environment variable from .env.local, fallback to Flask default
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Before every request leaves the frontend, this function runs.
 * It injects the JWT token so the backend knows who is calling.
 */
api.interceptors.request.use(
  (config) => {
    // Grab the token we saved in AuthContext/LocalStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('safeconfig_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * This handles common errors globally so you don't have to 
 * write "if (error.status === 403)" in every single component.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized: Token might be expired
      console.warn("Session expired. Logging out...");
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    }

    if (status === 403) {
      // Forbidden: Role mismatch or AI Guardrail block
      // We pass the error back so the UI can show the AI's specific advice
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;