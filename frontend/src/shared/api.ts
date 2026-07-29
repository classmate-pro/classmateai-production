import axios from 'axios';

const baseURL = import.meta.env.VITE_AUTH_API_URL || 'https://classmateai-authservice.onrender.com/api/auth';

const api = axios.create({
  baseURL,
  withCredentials: true, // Crucial for reading/writing refresh token cookies
});

// Automatically inject access token into headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to auto-refresh access token on expiration (401 error)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        // Let user components handle redirecting/logging out
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
