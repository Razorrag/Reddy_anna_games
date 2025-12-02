import { useMutation } from '@tanstack/react-query';

export function useDeleteNotification() {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.warn('useDeleteNotification: Stub implementation');
      return { success: true };
    },
  });
}
