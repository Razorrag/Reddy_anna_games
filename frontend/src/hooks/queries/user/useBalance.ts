import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface BalanceData {
  mainBalance: number;
  bonusBalance: number;
  totalBalance: number;
}

/**
 * Fetch user balance with high refresh rate
 */
export const useBalance = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.balance(userId),
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}/balance` : '/api/users/balance';
      const { data } = await api.get<ApiResponse<BalanceData>>(endpoint);
      return data.data!;
    },
    staleTime: 10 * 1000, // 10 seconds - refresh frequently for balance
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
};