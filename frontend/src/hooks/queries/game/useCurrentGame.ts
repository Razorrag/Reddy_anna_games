import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Game, ApiResponse } from '../../../types';

/**
 * Fetch current game configuration
 */
export const useCurrentGame = () => {
  return useQuery({
    queryKey: queryKeys.game.current,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Game>>('/api/game/current');
      return data.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - game settings don't change often
  });
};