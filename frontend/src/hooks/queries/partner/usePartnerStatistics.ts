import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface PartnerStatisticsResponse {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  totalBets: number;
  totalWagered: number;
  totalCommissionEarned: number;
  averageCommissionPerPlayer: number;
  conversionRate: number;
  retentionRate: number;
  growthRate: number;
  playersByMonth: Array<{
    month: string;
    newPlayers: number;
    activePlayers: number;
  }>;
  commissionTrend: Array<{
    date: string;
    amount: number;
  }>;
}

/**
 * Fetch partner statistics and analytics (Partner only)
 */
export const usePartnerStatistics = (partnerId?: string) => {
  return useQuery({
    queryKey: queryKeys.partner.statistics(partnerId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PartnerStatisticsResponse>>(
        '/api/partner/statistics'
      );
      return data.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};