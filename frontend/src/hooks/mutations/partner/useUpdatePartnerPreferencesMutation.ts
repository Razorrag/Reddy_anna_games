import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerPreferencesMutation() {
  return useMutation({
    mutationFn: async (preferences: any) => {
      console.warn('useUpdatePartnerPreferencesMutation: Stub implementation');
      return { success: true };
    },
  });
}
