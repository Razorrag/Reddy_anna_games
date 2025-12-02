import { useMutation } from '@tanstack/react-query';

export function useCreatePayoutRequestMutation() {
  return useMutation({
    mutationFn: async (amount: number) => {
      console.warn('useCreatePayoutRequestMutation: Stub implementation');
      return { success: true };
    },
  });
}
