import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { UserStatistics, ApiResponse } from '../../../types';

/**
 * Fetch user game statistics
 */
export const useStatistics = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.statistics(userId),
    queryFn: async () => {
      const endpoint = userId 
        ? `/api/users/${userId}/statistics` 
        : '/api/users/statistics';
      const { data } = await api.get<ApiResponse<UserStatistics>>(endpoint);
      return data.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};