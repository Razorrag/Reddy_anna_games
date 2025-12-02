import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

/**
 * Fetch user profile
 */
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: async () => {
      const endpoint = userId ? `/api/users/${userId}` : '/api/users/profile';
      const { data } = await api.get<ApiResponse<User>>(endpoint);
      return data.data!;
    },
    enabled: true, // Always enabled, will use current user if userId not provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};