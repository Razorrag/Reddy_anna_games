import { useMutation } from '@tanstack/react-query';

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useDeleteUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
