import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { useGameStore } from '../../../store/gameStore';
import { useUserStore } from '../../../store/userStore';
import { toast } from 'sonner';

interface UndoBetParams {
  betId: string;
}

interface UndoBetResponse {
  message: string;
  bet: any;
  refundAmount: number;
}

export function useUndoBet() {
  const { removeMyBet } = useGameStore();
  const { incrementBalance } = useUserStore();

  return useMutation({
    mutationFn: async (params: UndoBetParams) => {
      const response = await api.post<UndoBetResponse>('/games/undo-bet', params);
      return response.data;
    },
    onSuccess: (data) => {
      // Remove the bet from the local state
      removeMyBet(data.bet.id);

      // Update balance
      incrementBalance(data.refundAmount);

      // Invalidate relevant queries
      invalidateQueries.userBalance();
      invalidateQueries.currentRound();

      toast.success(`Bet undone - ₹${data.refundAmount.toFixed(2)} refunded`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to undo bet';
      toast.error(message);
    },
  });
}