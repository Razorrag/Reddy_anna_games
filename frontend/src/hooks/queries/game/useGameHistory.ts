import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { GameRound, PaginatedResponse, ApiResponse } from '../../../types';

interface GameHistoryFilters {
  status?: 'complete' | 'cancelled';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch paginated game history
 */
export const useGameHistory = (filters?: GameHistoryFilters) => {
  return useQuery({
    queryKey: queryKeys.game.history(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const { data } = await api.get<ApiResponse<PaginatedResponse<GameRound>>>(
        `/api/game/history?${params}`
      );
      return data.data!;
    },
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData,
  });
};