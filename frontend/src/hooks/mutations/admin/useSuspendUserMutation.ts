import { useMutation } from '@tanstack/react-query';

export function useSuspendUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useSuspendUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
