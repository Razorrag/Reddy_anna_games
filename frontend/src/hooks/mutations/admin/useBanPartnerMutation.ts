import { useMutation } from '@tanstack/react-query';

export function useBanPartnerMutation() {
  return useMutation({
    mutationFn: async (partnerId: string) => {
      console.warn('useBanPartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
