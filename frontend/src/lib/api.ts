import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';

// IMPORTANT: baseURL should NOT include /api as all hooks add it in their URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Axios instance with interceptors
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle errors
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle 401 Unauthorized - Clear ALL auth data including Zustand persist
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage'); // Clear Zustand persisted auth state
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Show error toast
    toast.error(message);
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Set auth token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}