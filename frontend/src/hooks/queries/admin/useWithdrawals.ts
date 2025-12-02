import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Transaction, ApiResponse } from '../../../types';

interface WithdrawalsFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  userId?: string;
}

interface WithdrawalsResponse {
  withdrawals: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

/**
 * Fetch withdrawal requests with filters (Admin only)
 */
export const useWithdrawals = (filters?: WithdrawalsFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.withdrawals(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.userId) params.append('userId', filters.userId);

      const { data } = await api.get<ApiResponse<WithdrawalsResponse>>(
        `/api/admin/withdrawals?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 10000, // 10 seconds - frequent for pending approvals
  });
};