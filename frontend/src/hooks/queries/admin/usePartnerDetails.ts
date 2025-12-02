import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

interface PartnerDetailsResponse extends User {
  totalPlayers: number;
  activePlayers: number;
  totalCommissionEarned: number;
  pendingCommission: number;
  totalWithdrawn: number;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
  }>;
  topPlayers: Array<{
    id: string;
    username: string;
    totalWagered: number;
    commissionGenerated: number;
  }>;
}

/**
 * Fetch detailed partner information (Admin only)
 */
export const usePartnerDetails = (partnerId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.admin.partnerDetails(partnerId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PartnerDetailsResponse>>(
        `/api/admin/partners/${partnerId}`
      );
      return data.data!;
    },
    enabled: !!partnerId,
    staleTime: 60000, // 1 minute
  });
};