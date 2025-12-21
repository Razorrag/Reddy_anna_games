import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import { toast } from 'sonner';
import type { Bet } from '../../../types';

interface RebetParams {
  currentRoundId: string;
}

interface RebetResponse {
  message: string;
  bets: Bet[];
  totalAmount: number;
  count: number;
}

export function useRebet() {
  const { addMyBets } = useGameStore();
  const { decrementBalance } = useUserStore();

  return useMutation({
    mutationFn: async (params: RebetParams) => {
      const response = await api.post<RebetResponse>('/games/rebet', params);
      return response.data;
    },
    onSuccess: (data) => {
      // Add all bets to local state
      addMyBets(data.bets);

      // Update balance
      decrementBalance(data.totalAmount);

      // Invalidate relevant queries
      invalidateQueries.userBalance();
      invalidateQueries.currentRound();

      toast.success(`${data.count} bet(s) replayed - ₹${data.totalAmount.toFixed(2)}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to replay bets';
      toast.error(message);
    },
  });
}