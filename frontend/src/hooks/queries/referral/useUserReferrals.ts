import { useQuery } from '@tanstack/react-query';

export function useUserReferrals() {
  return useQuery({
    queryKey: ['user-referrals'],
    queryFn: async () => {
      console.warn('useUserReferrals: Stub implementation');
      return [];
    },
  });
}
