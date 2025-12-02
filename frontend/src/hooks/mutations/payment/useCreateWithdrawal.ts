import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse, Transaction } from '../../../types';

interface CreateWithdrawalData {
  amount: number;
  upiId: string;
}

/**
 * Create withdrawal request mutation hook
 */
export const useCreateWithdrawal = () => {
  return useMutation({
    mutationFn: async (data: CreateWithdrawalData) => {
      const response = await api.post<ApiResponse<Transaction>>(
        '/api/payment/withdraw',
        data
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate balance and transactions
      invalidateQueries.userBalance();
      invalidateQueries.userTransactions();
      
      toast.success('Withdrawal request submitted. Pending admin approval.');
    },
  });
};