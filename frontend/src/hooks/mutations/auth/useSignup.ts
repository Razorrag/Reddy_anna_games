import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'wouter';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import type { User, ApiResponse } from '../../../types';

interface SignupData {
  phone: string;
  name: string;
  password: string;
  referralCode?: string;
}

interface SignupResponse {
  user: User;
  token: string;
  signupBonus: number;
}

/**
 * Signup mutation with automatic ₹500 signup bonus
 */
export const useSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await api.post<ApiResponse<SignupResponse>>('/api/auth/signup', data);
      return response.data.data!;
    },

    onSuccess: (data) => {
      // Update auth store
      login(data.user, data.token);
      
      // Show success message with bonus
      toast.success(
        `Welcome ${data.user.name}! ₹${data.signupBonus} signup bonus added to your account!`,
        { duration: 5000 }
      );
      
      // Navigate to game
      navigate('/game');
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Signup failed';
      toast.error(message);
    },
  });
};