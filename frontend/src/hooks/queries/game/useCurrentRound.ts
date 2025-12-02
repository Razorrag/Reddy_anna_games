import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { GameRound, ApiResponse } from '../../../types';

/**
 * Fetch current active game round with high refresh rate
 */
export const useCurrentRound = () => {
  return useQuery({
    queryKey: queryKeys.game.currentRound,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GameRound>>('/api/game/current-round');
      return data.data!;
    },
    staleTime: 5 * 1000, // 5 seconds - very fresh for active game
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
    refetchOnWindowFocus: true,
    retry: 5, // Retry more for critical game data
  });
};