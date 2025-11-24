import { apiClient } from "@/lib/api-client";

export interface CreateGameUserDto {
  name: string;
  description?: string;
  developer: string;
  editor: string;
  year: number;
}

export interface GameProposal {
  id: number;
  name: string;
  description?: string;
  developer: string;
  editor: string;
  year: number;
  image?: string;
  status: 'pending' | 'validated' | 'moderated';
  createdAt: string;
  updatedAt: string;
}

export const gameUserService = {
  // Vérifier si je peux proposer
  async canPropose(year: number) {
    const response = await apiClient.get<{
      canPropose: boolean;
      currentCount: number;
      maxAllowed: number;
      remaining: number;
    }>('/games/user/can-propose', { params: { year } });
    return response;
  },

  // Créer une proposition
  async createProposal(data: CreateGameUserDto, image?: File) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('developer', data.developer);
    formData.append('editor', data.editor);
    formData.append('year', data.year.toString());
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (image) {
      formData.append('image', image);
    }

    return apiClient.post('/games/user', formData/*, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }*/);
  },

  // Rechercher des jeux existants
  async searchGames(query: string) {
    const response = await apiClient.get<any[]>('/games/user/search', {
      params: { query },
    });
    return response;
  },

  // Obtenir mes propositions
  async getMyProposals(page: number = 1, limit: number = 10) {
    return apiClient.get('/games/user/my-proposals', {
      params: { page, limit },
    });
  },

  // Statistiques
  async getMyStats(year?: number) {
    return apiClient.get('/games/user/stats', {
      params: year ? { year } : undefined,
    });
  },

  // Supprimer une proposition
  async deleteProposal(id: number) {
    return apiClient.delete(`/games/user/my-proposals/${id}`);
  },
};
