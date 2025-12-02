import { useMutation } from '@tanstack/react-query';

export function useUploadVerificationDocument() {
  return useMutation({
    mutationFn: async (file: File) => {
      console.warn('useUploadVerificationDocument: Stub implementation');
      return { success: true };
    },
  });
}
