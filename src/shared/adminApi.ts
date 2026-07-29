import axios from 'axios';
import { AUTH_BASE_URL } from './api';
import { emitSessionExpired } from './sessionExpired';
import { AdminUser, AdminStats } from '../types';

// Base URL for the super-admin management API (auth-service, /api/admin/*).
const baseURL =
  (import.meta.env.VITE_BACKEND_URL || 'https://authservice-729310986605.us-central1.run.app') + '/api/admin';

const adminApi = axios.create({ baseURL });

// Reuse the same access token as the rest of the app.
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh access token on 401 (same flow as shared/api.ts).
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${AUTH_BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return adminApi(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        emitSessionExpired();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchUsers(
  params: { search?: string; page?: number; limit?: number } = {}
): Promise<UsersResponse> {
  const res = await adminApi.get('/users', { params });
  return res.data;
}

export async function fetchStats(): Promise<AdminStats> {
  const res = await adminApi.get('/stats');
  return res.data.stats;
}

export async function updateUserRole(id: string, role: string): Promise<AdminUser> {
  const res = await adminApi.patch(`/users/${id}`, { role });
  return res.data.user;
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  const res = await adminApi.patch(`/users/${id}`, { isActive });
  return res.data.user;
}
