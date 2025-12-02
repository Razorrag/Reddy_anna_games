import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface ApproveWithdrawalData {
  transactionId: string;
  utrNumber?: string;
}

/**
 * Approve withdrawal mutation hook (Admin only)
 */
export const useApproveWithdrawal = () => {
  return useMutation({
    mutationFn: async (data: ApproveWithdrawalData) => {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/api/admin/withdrawals/${data.transactionId}/approve`,
        { utrNumber: data.utrNumber }
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate withdrawals list
      invalidateQueries.withdrawals();
      
      toast.success('Withdrawal approved successfully');
    },
  });
};