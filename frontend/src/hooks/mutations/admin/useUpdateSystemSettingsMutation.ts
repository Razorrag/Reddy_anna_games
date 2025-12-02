import { useMutation } from '@tanstack/react-query';

export function useUpdateSystemSettingsMutation() {
  return useMutation({
    mutationFn: async (settings: any) => {
      console.warn('useUpdateSystemSettingsMutation: Stub implementation');
      return { success: true };
    },
  });
}
