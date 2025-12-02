import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { ApiResponse } from '../../../types';

interface LivePlayerCountResponse {
  count: number;
  timestamp: string;
}

/**
 * Fetch live player count with frequent updates
 */
export const useLivePlayerCount = () => {
  return useQuery({
    queryKey: queryKeys.game.livePlayerCount,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LivePlayerCountResponse>>('/api/game/live-count');
      return data.data!;
    },
    staleTime: 3000, // 3 seconds - very frequent for live count
    refetchInterval: 5000, // Auto-refetch every 5 seconds
  });
};