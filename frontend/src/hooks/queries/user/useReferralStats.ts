import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
  monthlyReferrals: number;
  conversionRate: number;
}

/**
 * Fetch referral statistics
 */
export const useReferralStats = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.referralStats(userId),
    queryFn: async () => {
      const endpoint = userId 
        ? `/api/users/${userId}/referral-stats` 
        : '/api/users/referral-stats';
      const { data } = await api.get<ApiResponse<ReferralStats>>(endpoint);
      return data.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};