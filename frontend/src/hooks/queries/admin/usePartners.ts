import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryClient';
import type { User, ApiResponse } from '../../../types';

interface PartnersFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'suspended';
}

interface PartnersResponse {
  partners: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch partners list with filters (Admin only)
 */
export const usePartners = (filters?: PartnersFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.partners(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);

      const { data } = await api.get<ApiResponse<PartnersResponse>>(
        `/api/admin/partners?${params.toString()}`
      );
      return data.data!;
    },
    staleTime: 60000, // 1 minute
  });
};