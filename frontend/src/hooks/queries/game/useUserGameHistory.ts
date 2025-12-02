import { useQuery } from '@tanstack/react-query';

export function useUserGameHistory() {
  return useQuery({
    queryKey: ['user-game-history'],
    queryFn: async () => {
      console.warn('useUserGameHistory: Stub implementation');
      return [];
    },
  });
}
