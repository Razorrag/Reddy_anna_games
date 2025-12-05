import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GameHistoryItem {
  id: string;
  roundNumber: number;
  jokerCard: string;
  winningCard?: string;
  winningSide: 'andar' | 'bahar';
  createdAt: string;
  status: string;
}

interface UseGameHistoryOptions {
  limit?: number;
  enabled?: boolean;
}

export function useGameHistory(options: UseGameHistoryOptions = {}) {
  const { limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: ['gameHistory', limit],
    queryFn: async () => {
      const response = await api.get<GameHistoryItem[]>(
        `/game/history?limit=${limit}`
      );
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}