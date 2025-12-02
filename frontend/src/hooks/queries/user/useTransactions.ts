import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Transaction, PaginatedResponse, ApiResponse } from '../../../types';

interface TransactionFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch paginated transaction history with filters
 */
export const useTransactions = (userId?: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.user.transactions(userId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const endpoint = userId 
        ? `/api/users/${userId}/transactions?${params}` 
        : `/api/users/transactions?${params}`;
        
      const { data } = await api.get<ApiResponse<PaginatedResponse<Transaction>>>(endpoint);
      return data.data!;
    },
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};