import { useMutation } from '@tanstack/react-query';

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.warn('useMarkNotificationRead: Stub implementation');
      return { success: true };
    },
  });
}
