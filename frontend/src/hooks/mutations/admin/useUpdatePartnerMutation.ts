import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerMutation() {
  return useMutation({
    mutationFn: async (data: { partnerId: string; updates: any }) => {
      console.warn('useUpdatePartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
