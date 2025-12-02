import { useMutation } from '@tanstack/react-query';

export function useCancelPayoutRequestMutation() {
  return useMutation({
    mutationFn: async (requestId: string) => {
      console.warn('useCancelPayoutRequestMutation: Stub implementation');
      return { success: true };
    },
  });
}
