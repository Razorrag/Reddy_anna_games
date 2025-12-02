import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryClient, queryKeys, invalidateQueries } from '../../../lib/queryClient';
import { useGameStore } from '../../../store/gameStore';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types';

interface CancelBetData {
  betId: string;
}

interface CancelBetResponse {
  success: boolean;
  refundAmount: number;
}

/**
 * Cancel bet mutation hook with optimistic updates
 */
export const useCancelBet = () => {
  const removeBet = useGameStore((state) => state.removeBet);

  return useMutation({
    mutationFn: async (data: CancelBetData) => {
      const response = await api.post<ApiResponse<CancelBetResponse>>(
        '/api/game/cancel-bet',
        data
      );
      return response.data.data!;
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.game.currentRound });
      
      // Optimistically remove bet from local state
      removeBet(data.betId);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      invalidateQueries.currentRound();
      invalidateQueries.userBalance();
      
      toast.success(`Bet cancelled. ₹${data.refundAmount} refunded`);
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      invalidateQueries.currentRound();
      
      toast.error('Failed to cancel bet');
    },
  });
};