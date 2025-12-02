import { useMutation } from '@tanstack/react-query';

export function useSuspendPartnerMutation() {
  return useMutation({
    mutationFn: async (partnerId: string) => {
      console.warn('useSuspendPartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
