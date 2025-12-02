import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

interface PartnerPlayersFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'totalWagered' | 'commissionGenerated' | 'lastActive';
}

interface PartnerPlayersResponse {
  players: Array<User & {
    totalWagered: number;
    totalBets: number;
    commissionGenerated: number;
    lastActiveAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch partner's referred players (Partner only)
 */
export const usePartnerPlayers = (partnerId?: string, filters?: PartnerPlayersFilters) => {
  return useQuery({
    queryKey: queryKeys.partner.players(partnerId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const { data } = await api.get<ApiResponse<PartnerPlayersResponse>>(
        `/api/partner/players?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 60000, // 1 minute
  });
};