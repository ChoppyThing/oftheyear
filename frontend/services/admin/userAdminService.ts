import { apiClient } from '@/lib/api-client';

export const userAdminService = {
  getStats: async (): Promise<{ total: number; verified: number; unverified: number }> => {
    return apiClient.get('/admin/users/stats');
  },
};
