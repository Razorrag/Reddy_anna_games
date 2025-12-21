import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import { toast } from 'sonner';
import type { Bet } from '../../../types';

interface DoubleBetsParams {
  roundId: string;
}

interface DoubleBetsResponse {
  message: string;
  bets: Bet[];
  totalAmount: number;
  count: number;
}

export function useDoubleBets() {
  const { addMyBets } = useGameStore();
  const { decrementBalance } = useUserStore();

  return useMutation({
    mutationFn: async (params: DoubleBetsParams) => {
      const response = await api.post<DoubleBetsResponse>('/games/double-bets', params);
      return response.data;
    },
    onSuccess: (data) => {
      // Add all doubled bets to local state
      addMyBets(data.bets);

      // Update balance
      decrementBalance(data.totalAmount);

      // Invalidate relevant queries
      invalidateQueries.userBalance();
      invalidateQueries.currentRound();

      toast.success(`Doubled ${data.count} bet(s) - ₹${data.totalAmount.toFixed(2)} added`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to double bets';
      toast.error(message);
    },
  });
}