import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { Bet, ApiResponse } from '../../../types';

/**
 * Fetch user's bets for a specific round or all bets
 */
export const useUserBets = (userId?: string, roundId?: string) => {
  return useQuery({
    queryKey: queryKeys.game.userBets(userId, roundId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roundId) params.append('roundId', roundId);
      
      const endpoint = userId 
        ? `/api/users/${userId}/bets?${params}`
        : `/api/users/bets?${params}`;
        
      const { data} = await api.get<ApiResponse<Bet[]>>(endpoint);
      return data.data!;
    },
    enabled: !!userId || !!roundId, // Only fetch if userId or roundId provided
    staleTime: 30 * 1000, // 30 seconds - bets change frequently
  });
};