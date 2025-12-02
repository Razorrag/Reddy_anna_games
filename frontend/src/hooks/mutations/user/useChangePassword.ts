import { useMutation } from '@tanstack/react-query';

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      console.warn('useChangePassword: Stub implementation');
      return { success: true };
    },
  });
}
