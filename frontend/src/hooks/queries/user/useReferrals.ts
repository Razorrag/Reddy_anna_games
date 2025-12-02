import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Referral, ApiResponse } from '../../../types';

/**
 * Fetch user referrals list
 */
export const useReferrals = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.referrals(userId),
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}/referrals` : '/api/users/referrals';
      const { data } = await api.get<ApiResponse<Referral[]>>(endpoint);
      return data.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};