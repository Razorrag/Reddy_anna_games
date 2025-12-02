import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface Commission {
  id: string;
  userId: string;
  username: string;
  amount: number;
  betAmount: number;
  commissionRate: number;
  status: 'pending' | 'paid';
  createdAt: string;
  paidAt?: string;
}

interface CommissionsFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'paid';
  startDate?: string;
  endDate?: string;
}

interface CommissionsResponse {
  commissions: Commission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalPending: number;
  totalPaid: number;
}

/**
 * Fetch partner commission history (Partner only)
 */
export const usePartnerCommissions = (partnerId?: string, filters?: CommissionsFilters) => {
  return useQuery({
    queryKey: queryKeys.partner.commissions(partnerId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const { data } = await api.get<ApiResponse<CommissionsResponse>>(
        `/api/partner/commissions?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 30000, // 30 seconds
  });
};