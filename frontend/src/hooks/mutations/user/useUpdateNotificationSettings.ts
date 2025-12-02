import { useMutation } from '@tanstack/react-query';

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: async (data: any) => {
      console.warn('useUpdateNotificationSettings: Stub implementation');
      return { success: true };
    },
  });
}
