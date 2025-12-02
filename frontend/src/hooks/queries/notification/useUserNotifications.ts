import { useQuery } from '@tanstack/react-query';

export function useUserNotifications() {
  return useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      console.warn('useUserNotifications: Stub implementation');
      return [];
    },
  });
}
