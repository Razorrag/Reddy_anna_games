import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface ForgotPasswordData {
  phone: string;
}

interface ForgotPasswordResponse {
  message: string;
  whatsappSent: boolean;
}

/**
 * Forgot password mutation - sends reset instructions via WhatsApp
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await api.post<ApiResponse<ForgotPasswordResponse>>(
        '/api/auth/forgot-password',
        data
      );
      return response.data.data!;
    },

    onSuccess: (data) => {
      toast.success(data.message || 'Password reset instructions sent to WhatsApp');
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send reset instructions';
      toast.error(message);
    },
  });
};