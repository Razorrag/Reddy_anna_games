import { useMutation } from '@tanstack/react-query';

export function useEmergencyStopMutation() {
  return useMutation({
    mutationFn: async () => {
      console.warn('useEmergencyStopMutation: Stub implementation');
      return { success: true };
    },
  });
}
