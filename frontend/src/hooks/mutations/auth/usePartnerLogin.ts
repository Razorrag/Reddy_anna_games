import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface PartnerLoginData {
  username: string;
  password: string;
}

interface PartnerLoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'partner';
  };
}

/**
 * Partner login mutation hook
 */
export const usePartnerLogin = () => {
  const [, setLocation] = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: PartnerLoginData) => {
      const response = await api.post<ApiResponse<PartnerLoginResponse>>(
        '/api/auth/partner/login',
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      // Store auth data
      setAuth(data.user, data.token);
      
      // Navigate to partner dashboard
      setLocation('/partner/dashboard');
      
      toast.success('Welcome back!');
    },
  });
};