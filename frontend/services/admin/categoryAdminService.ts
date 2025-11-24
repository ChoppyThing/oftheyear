import { apiClient } from '@/lib/api-client';
import {
  Category,
  CategoriesListResponse,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStats,
  VotePhaseStatsResponse,
} from '@/types/CategoryType';

export const categoryAdminService = {
  list: async (filters: CategoryFilters = {}): Promise<CategoriesListResponse> => {
    return apiClient.get('/admin/category', { params: filters });
  },

  getById: async (id: number): Promise<Category> => {
    return apiClient.get(`/admin/category/${id}`);
  },

  getStats: async (id: number): Promise<CategoryStats> => {
    return apiClient.get(`/admin/category/${id}/stats`);
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    return apiClient.post('/admin/category', data);
  },

  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    return apiClient.patch(`/admin/category/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/admin/category/${id}`);
  },

  changePhase: async (id: number, phase: string): Promise<Category> => {
    return apiClient.patch(`/admin/category/${id}`, { phase });
  },

    async getVotePhaseStats(year?: number): Promise<VotePhaseStatsResponse> {
    const params = year ? { year } : {};
    return await apiClient.get('/admin/category/stats/vote-phase', { params });
  },

  getGlobalStats: async (): Promise<{ total: number; nomination: number; vote: number; closed: number }> => {
    return apiClient.get('/admin/category/stats/global');
  },
};
