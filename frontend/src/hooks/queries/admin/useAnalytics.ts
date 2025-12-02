import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

interface AnalyticsResponse {
  revenue: Array<{
    date: string;
    total: number;
    deposits: number;
    withdrawals: number;
    profit: number;
  }>;
  users: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    retention: number;
  }>;
  games: Array<{
    date: string;
    totalBets: number;
    totalWagered: number;
    totalPayout: number;
    houseEdge: number;
  }>;
  partners: Array<{
    date: string;
    totalCommissions: number;
    activePartners: number;
  }>;
}

/**
 * Fetch detailed analytics with date range filters (Admin only)
 */
export const useAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.analytics(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.groupBy) params.append('groupBy', filters.groupBy);

      const { data } = await api.get<ApiResponse<AnalyticsResponse>>(
        `/api/admin/analytics?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};