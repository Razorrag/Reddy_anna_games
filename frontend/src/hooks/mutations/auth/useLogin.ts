import { useMutation } from '@tanstack/react-query';
import { useLocation } from "wouter";
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import type { User, ApiResponse } from '../../../types';

interface LoginData {
  phone?: string;
  username?: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Login mutation
 */
export const useLogin = () => {
  const [, navigate] = useLocation();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
      return response.data.data!;
    },

    onSuccess: (data) => {
      // Update auth store
      login(data.user, data.token);
      
      // Show success message
      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/game');
      }
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });
};