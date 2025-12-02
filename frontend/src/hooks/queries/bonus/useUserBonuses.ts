import { useQuery } from '@tanstack/react-query';

export function useUserBonuses() {
  return useQuery({
    queryKey: ['user-bonuses'],
    queryFn: async () => {
      console.warn('useUserBonuses: Stub implementation');
      return [];
    },
  });
}
