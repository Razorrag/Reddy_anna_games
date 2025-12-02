import { useMutation } from '@tanstack/react-query';

export function useBanUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useBanUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
