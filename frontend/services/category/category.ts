import { apiClient } from "@/lib/api-client";
import { Category } from "@/types/CategoryType";

export const categoryService = {
  /**
   * Récupérer toutes les catégories validées
   */
  async getValidatedCategories(year?: number): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/category/nominated', {
      params: year ? { year } : undefined,
    });
    return response;
  },

  /**
   * Récupérer une catégorie par ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  /**
   * Récupérer une catégorie par slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  },
};
