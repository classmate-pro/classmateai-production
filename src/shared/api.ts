import axios from 'axios';
import { emitSessionExpired } from './sessionExpired';

// Base URL for all auth API calls (e.g. /login, /register, /me, /refresh)
const baseURL =
  import.meta.env.VITE_AUTH_API_URL || 'https://authservice-729310986605.us-central1.run.app/api/auth';

// Exported so other API clients (e.g. documentApi) can call /refresh themselves
export const AUTH_BASE_URL = baseURL;

// Backend root URL — used for passport OAuth redirect (GET /auth/google)
export const BACKEND_GOOGLE_AUTH_URL =
  (import.meta.env.VITE_BACKEND_URL || 'https://authservice-729310986605.us-central1.run.app') + '/auth/google';

const api = axios.create({
  baseURL,
  withCredentials: true, // Required for refreshToken cookie
});

// Automatically inject access token from localStorage into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh access token on 401 — calls POST /api/auth/refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use the same baseURL so the path is correct: /api/auth/refresh
        const res = await axios.post(
          `${baseURL}/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — the session is genuinely expired. Clear it and
        // tell App.tsx to log the user out and show the login page.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        emitSessionExpired();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
