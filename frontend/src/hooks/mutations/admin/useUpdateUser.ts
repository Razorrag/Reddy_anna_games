import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { invalidateQueries } from '../../../lib/queryClient';
import { toast } from 'sonner';
import type { ApiResponse, User } from '../../../types';

interface UpdateUserData {
  userId: string;
  updates: {
    status?: 'active' | 'suspended' | 'banned';
    role?: 'user' | 'admin' | 'partner';
    balance?: number;
  };
}

/**
 * Update user mutation hook (Admin only)
 */
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await api.patch<ApiResponse<User>>(
        `/api/admin/users/${data.userId}`,
        data.updates
      );
      return response.data.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate user details
      invalidateQueries.admin();
      
      toast.success('User updated successfully');
    },
  });
};