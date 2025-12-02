import { useMutation } from '@tanstack/react-query';

export function useUpdateGameSettingsMutation() {
  return useMutation({
    mutationFn: async (settings: any) => {
      console.warn('useUpdateGameSettingsMutation: Stub implementation');
      return { success: true };
    },
  });
}
