import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface RejectDepositData {
  transactionId: string;
  reason?: string;
}

/**
 * Reject deposit mutation hook (Admin only)
 */
export const useRejectDeposit = () => {
  return useMutation({
    mutationFn: async (data: RejectDepositData) => {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/api/admin/deposits/${data.transactionId}/reject`,
        { reason: data.reason }
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate deposits list
      invalidateQueries.deposits();
      
      toast.success('Deposit rejected');
    },
  });
};