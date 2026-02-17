import axios from 'axios';

/**
 * CORE API GATEWAY
 * Centralized configuration for the SafeConfig AI backend.
 */
const api = axios.create({
  // Fulfills environment-aware deployment (Dev/Prod)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR: The "Identity Provider"
 * Automatically injects the JWT into the Authorization header.
 * Fulfills: 'Security' and 'Proper Auth' requirements.
 */
api.interceptors.request.use(
  (config) => {
    // We use the specific key 'safeconfig_token' to match our Auth flow
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
 * RESPONSE INTERCEPTOR: The "Protocol Enforcer"
 * Globally handles session expiry and AI Guardrail blocks.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 1. Session Expiry (401 Unauthorized)
    if (status === 401) {
      console.warn("🛡️ SafeConfig: Session invalid or expired. Redirecting...");
      if (typeof window !== 'undefined') {
        localStorage.removeItem('safeconfig_token');
        localStorage.removeItem('safeconfig_user');
        // Prevent infinite loops by checking if we are already home
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    // 2. AI Guardrail or RBAC Block (403 Forbidden)
    if (status === 403) {
      // Pass the error to the UI so we can display specific AI advice
      // e.g., "Blocked: High Risk Score 9/10 - Too many active users"
      console.error("🚫 Action Blocked:", error.response?.data?.message);
      return Promise.reject(error);
    }

    // 3. Validation Errors (400 Bad Request)
    if (status === 400) {
      console.error("⚠️ Validation Failed:", error.response?.data?.data || error.response?.data?.message);
      return Promise.reject(error);
    }

    // 4. Server Errors (500)
    if (status === 500) {
      console.error("🔥 Backend Server Error. Check Flask logs.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;