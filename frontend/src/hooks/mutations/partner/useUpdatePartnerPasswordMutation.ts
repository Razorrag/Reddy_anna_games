import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerPasswordMutation() {
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      console.warn('useUpdatePartnerPasswordMutation: Stub implementation');
      return { success: true };
    },
  });
}
