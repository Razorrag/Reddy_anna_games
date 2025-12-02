import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface PartnerEarningsResponse {
  totalEarned: number;
  pendingCommission: number;
  availableBalance: number;
  totalWithdrawn: number;
  todayEarnings: number;
  monthEarnings: number;
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    commissions: number;
  }>;
  topEarningPlayers: Array<{
    userId: string;
    username: string;
    totalCommission: number;
  }>;
}

/**
 * Fetch partner earnings summary (Partner only)
 */
export const usePartnerEarnings = (partnerId?: string) => {
  return useQuery({
    queryKey: queryKeys.partner.earnings(partnerId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PartnerEarningsResponse>>(
        '/api/partner/earnings'
      );
      return data.data!;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Auto-refetch every minute
  });
};