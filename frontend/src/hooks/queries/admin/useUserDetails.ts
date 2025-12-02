import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

interface UserDetailsResponse extends User {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referredUsersCount: number;
  lifetimeCommission: number;
}

/**
 * Fetch detailed user information (Admin only)
 */
export const useUserDetails = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetails(userId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserDetailsResponse>>(
        `/api/admin/users/${userId}`
      );
      return data.data!;
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
};