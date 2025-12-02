import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin' | 'partner';
  status?: 'active' | 'suspended' | 'banned';
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch paginated users list with filters (Admin only)
 */
export const useUsers = (filters?: UsersFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);

      const { data } = await api.get<ApiResponse<UsersResponse>>(
        `/api/admin/users?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 30000, // 30 seconds
  });
};