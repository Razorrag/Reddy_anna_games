import { useMutation } from '@tanstack/react-query';

export function useSubmitSupportTicket() {
  return useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      console.warn('useSubmitSupportTicket: Stub implementation');
      return { success: true };
    },
  });
}
