import { useMutation } from '@tanstack/react-query';

export function useDeclareWinnerMutation() {
  return useMutation({
    mutationFn: async (data: { winningSide: string }) => {
      console.warn('useDeclareWinnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
