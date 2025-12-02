import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { Deposit, ApiResponse } from '../../../types';

interface CreateDepositData {
  amount: number;
  screenshot: File;
}

/**
 * Create deposit request with screenshot upload
 */
export const useCreateDeposit = () => {
  return useMutation({
    mutationFn: async (data: CreateDepositData) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('screenshot', data.screenshot);

      const response = await api.post<ApiResponse<Deposit>>(
        '/api/payments/deposit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    },

    onSuccess: (data) => {
      toast.success(
        `Deposit request submitted! Amount: ₹${data.amount}. Please wait for admin approval.`,
        { duration: 5000 }
      );
      
      // Invalidate deposits query to show new request
      invalidateQueries.user();
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit deposit request';
      toast.error(message);
    },
  });
};