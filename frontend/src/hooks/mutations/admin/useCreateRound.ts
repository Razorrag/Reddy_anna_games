import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse, GameRound } from '../../../types';

interface CreateRoundData {
  gameId: string;
}

/**
 * Create new game round mutation hook (Admin only)
 */
export const useCreateRound = () => {
  return useMutation({
    mutationFn: async (data: CreateRoundData) => {
      const response = await api.post<ApiResponse<GameRound>>(
        '/api/admin/rounds/create',
        data
      );
      return response.data.data!;
    },
    onSuccess: () => {
      // Invalidate game queries
      invalidateQueries.game();
      invalidateQueries.currentRound();
      
      toast.success('New round created successfully');
    },
  });
};