import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryClient, invalidateQueries } from '../../../lib/queryClient';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import { toast } from 'sonner';
import type { Bet, ApiResponse } from '../../../types';

interface PlaceBetData {
  roundId: string;
  side: 'andar' | 'bahar';
  amount: number;
}

/**
 * Place bet mutation with optimistic updates
 */
export const usePlaceBet = () => {
  const { placeBet, selectSide } = useGameStore();
  const { decrementBalance } = useUserStore();

  return useMutation({
    mutationFn: async (data: PlaceBetData) => {
      const response = await api.post<ApiResponse<Bet>>('/bets', data);
      return response.data.data!;
    },

    // Optimistic update - update UI immediately
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'balance'] });
      await queryClient.cancelQueries({ queryKey: ['game', 'currentRound'] });

      // Snapshot previous values
      const previousBalance = useUserStore.getState().balance;
      const previousBets = useGameStore.getState().betting.currentBets;

      // Optimistically update stores
      placeBet(variables.side, variables.amount);
      decrementBalance(variables.amount);
      selectSide(variables.side);

      // Show immediate feedback
      toast.success(`Bet placed: ₹${variables.amount} on ${variables.side.toUpperCase()}`);

      // Return context for rollback
      return { previousBalance, previousBets };
    },

    // On success - invalidate relevant queries
    onSuccess: (data) => {
      invalidateQueries.userBalance();
      invalidateQueries.currentRound();
      
      // Add to bet history
      useGameStore.getState().betting.betHistory.push(data);
    },

    // On error - rollback optimistic update
    onError: (error: any, variables, context) => {
      if (context) {
        // Rollback balance
        useUserStore.setState({ balance: context.previousBalance });
        
        // Rollback bets
        useGameStore.setState((state) => ({
          betting: {
            ...state.betting,
            currentBets: context.previousBets,
          },
        }));
      }

      const message = error?.response?.data?.message || 'Failed to place bet';
      toast.error(message);
    },

    // Always refetch after error or success
    onSettled: () => {
      invalidateQueries.userBalance();
      invalidateQueries.currentRound();
    },
  });
};