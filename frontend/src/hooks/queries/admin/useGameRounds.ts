import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { GameRound, ApiResponse } from '../../../types';

interface GameRoundsFilters {
  page?: number;
  limit?: number;
  status?: 'betting' | 'playing' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

interface GameRoundsResponse {
  rounds: GameRound[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch game rounds history with filters (Admin only)
 */
export const useGameRounds = (filters?: GameRoundsFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.gameRounds(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const { data } = await api.get<ApiResponse<GameRoundsResponse>>(
        `/api/admin/game-rounds?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 30000, // 30 seconds
  });
};