import { useMutation } from '@tanstack/react-query';

export function useBulkUserActionMutation() {
  return useMutation({
    mutationFn: async (data: { userIds: string[]; action: string }) => {
      console.warn('useBulkUserActionMutation: Stub implementation');
      return { success: true };
    },
  });
}
