import { useMutation } from '@tanstack/react-query';

export function useUnlockBonus() {
  return useMutation({
    mutationFn: async (bonusId: string) => {
      console.warn('useUnlockBonus: Stub implementation');
      return { success: true };
    },
  });
}
