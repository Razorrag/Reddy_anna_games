import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerProfileMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      console.warn('useUpdatePartnerProfileMutation: Stub implementation');
      return { success: true };
    },
  });
}
