import { useMutation } from '@tanstack/react-query';

export function useStopRoundMutation() {
  return useMutation({
    mutationFn: async () => {
      console.warn('useStopRoundMutation: Stub implementation');
      return { success: true };
    },
  });
}
