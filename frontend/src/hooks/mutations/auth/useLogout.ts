import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../../lib/api';
import { queryClient } from '../../../lib/queryClient';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const [, setLocation] = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear auth state
      logout();
      
      // Clear all cached queries
      queryClient.clear();
      
      // Navigate to login
      setLocation('/login');
      
      toast.success('Logged out successfully');
    },
  });
};