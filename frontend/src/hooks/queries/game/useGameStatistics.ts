import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { GameStatistics, ApiResponse } from '../../../types';

/**
 * Fetch game statistics and analytics
 */
export const useGameStatistics = () => {
  return useQuery({
    queryKey: queryKeys.game.statistics,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GameStatistics>>('/api/game/statistics');
      return data.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};