import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Bonus, ApiResponse } from '../../../types';

/**
 * Fetch all user bonuses
 */
export const useBonuses = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.bonuses(userId),
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}/bonuses` : '/api/users/bonuses';
      const { data } = await api.get<ApiResponse<Bonus[]>>(endpoint);
      return data.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};