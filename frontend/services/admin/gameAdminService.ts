import { apiClient } from '@/lib/api-client';
import { Game, GamesListResponse, GameStatus } from '@/types/GameType';

interface ListGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  developer?: string;
  editor?: string;
  status?: GameStatus;
  authorId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface CreateGameData {
  name: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
}

export const gameAdminService = {
  list: async (params: ListGamesParams = {}): Promise<GamesListResponse> => {
    return apiClient.get('/admin/games', { params });
  },

  getById: async (id: number): Promise<Game> => {
    return apiClient.get(`/admin/games/${id}`);
  },

  create: async (data: CreateGameData): Promise<Game> => {
    return apiClient.post('/admin/games', data);
  },

  update: async (id: number, data: Partial<Game>): Promise<Game> => {
    return apiClient.patch(`/admin/games/${id}`, data);
  },

  approve: async (id: number): Promise<Game> => {
    return apiClient.post(`/admin/games/${id}/approve`);
  },

  reject: async (id: number): Promise<Game> => {
    return apiClient.post(`/admin/games/${id}/reject`);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/admin/games/${id}`);
  },
};
