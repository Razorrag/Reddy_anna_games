import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface ApproveDepositData {
  transactionId: string;
}

/**
 * Approve deposit mutation hook (Admin only)
 */
export const useApproveDeposit = () => {
  return useMutation({
    mutationFn: async (data: ApproveDepositData) => {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/api/admin/deposits/${data.transactionId}/approve`
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate deposits list
      invalidateQueries.deposits();
      
      toast.success('Deposit approved successfully');
    },
  });
};