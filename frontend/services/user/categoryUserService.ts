import { apiClient } from "@/lib/api-client";

export interface CreateCategoryDto {
  name: string;
  description?: string;
  year: number;
}

export interface CategoryProposal {
  id: number;
  name: string;
  description?: string;
  year: number;
  phase: "nomination" | "vote" | "closed"; // ✅ Phases au lieu de status
  createdAt: string;
  author?: {
    id: number;
    username: string;
  };
}

export interface MyProposalsResponse {
  data: CategoryProposal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MyStatsResponse {
  total: number;
  nomination: number; // ✅ Phases au lieu de status
  vote: number;
  closed: number;
}

export const categoryUserService = {
  // Créer une catégorie
  async createCategory(data: CreateCategoryDto): Promise<CategoryProposal> {
    return apiClient.post("/category/user", data);
  },

  // Lister mes catégories
  async getMyCategoryProposals(
    page = 1,
    limit = 10
  ): Promise<MyProposalsResponse> {
    return apiClient.get("/category/user/my-proposals", {
      params: { page, limit },
    });
  },

  // Obtenir une proposition spécifique
  async getProposalById(id: number): Promise<CategoryProposal> {
    return apiClient.get(`/category/user/my-proposals/${id}`);
  },

  // Statistiques
  async getMyStats(): Promise<MyStatsResponse> {
    return apiClient.get("/category/user/stats");
  },

  async hasProposed(year: number): Promise<boolean> {
    return await apiClient.get(
      `/category/user/has-proposed/${year}`
    );
  },
};
