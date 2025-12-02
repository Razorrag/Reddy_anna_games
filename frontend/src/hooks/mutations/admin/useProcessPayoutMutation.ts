import { useMutation } from '@tanstack/react-query';

export function useProcessPayoutMutation() {
  return useMutation({
    mutationFn: async (payoutId: string) => {
      console.warn('useProcessPayoutMutation: Stub implementation');
      return { success: true };
    },
  });
}
