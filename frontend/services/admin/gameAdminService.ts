import { apiClient } from '@/lib/api-client';
import { Game, GameStatus } from '@/types/GameType';

export interface CreateGameData {
  name: string;
  description?: string;
  developer?: string;
  editor?: string;
  image?: string;
  status?: GameStatus;
}

export interface UpdateGameData {
  name?: string;
  description?: string;
  developer?: string;
  editor?: string;
  image?: string;
  status?: GameStatus;
  removeImage?: boolean;
}

export interface GamesListResponse {
  data: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const gameAdminService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: GameStatus;
    search?: string;
  }): Promise<GamesListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiClient.get(`/admin/games${query ? `?${query}` : ''}`);
  },

  getById: async (id: number): Promise<Game> => {
    return apiClient.get(`/admin/games/${id}`);
  },

  create: async (data: CreateGameData | FormData): Promise<Game> => {
    return apiClient.post('/admin/games', data);
  },

  update: async (id: number, data: UpdateGameData | FormData): Promise<Game> => {
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

  getStats: async (): Promise<{ total: number; validated: number; pending: number; rejected: number }> => {
    return apiClient.get('/admin/games/stats');
  },
};
