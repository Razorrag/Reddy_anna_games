import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface RejectWithdrawalData {
  transactionId: string;
  reason?: string;
}

/**
 * Reject withdrawal mutation hook (Admin only)
 */
export const useRejectWithdrawal = () => {
  return useMutation({
    mutationFn: async (data: RejectWithdrawalData) => {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/api/admin/withdrawals/${data.transactionId}/reject`,
        { reason: data.reason }
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate withdrawals list
      invalidateQueries.withdrawals();
      
      toast.success('Withdrawal rejected');
    },
  });
};