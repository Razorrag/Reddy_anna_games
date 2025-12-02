import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface DashboardStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalPartners: number;
  activePartners: number;
  totalRevenue: number;
  totalPayouts: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  todayRevenue: number;
  todayNewUsers: number;
  todayActiveBets: number;
  monthlyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
  topGames: Array<{
    gameId: string;
    gameName: string;
    totalBets: number;
    totalRevenue: number;
  }>;
}

/**
 * Fetch admin dashboard statistics (Admin only)
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboardStats,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStatsResponse>>(
        '/api/admin/dashboard/stats'
      );
      return data.data!;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Auto-refetch every minute
  });
};