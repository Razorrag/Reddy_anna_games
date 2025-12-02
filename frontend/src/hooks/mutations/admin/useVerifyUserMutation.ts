import { useMutation } from '@tanstack/react-query';

export function useVerifyUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useVerifyUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
