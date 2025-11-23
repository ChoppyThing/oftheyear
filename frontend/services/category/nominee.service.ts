import { apiClient } from '@/lib/api-client';

export interface NominationStatus {
  count: number;
  gameIds: number[];
}

class CategoryNomineeService {
  /**
   * Récupérer les nominations de l'utilisateur depuis le backend
   */
  async getUserNominations(categoryId: number): Promise<NominationStatus> {
    return await apiClient.get<NominationStatus>(
      `/category-nominee/${categoryId}/user-nominations`
    );
  }

  /**
   * Ajouter une nomination
   */
  async addNomination(categoryId: number, gameId: number): Promise<void> {
    await apiClient.post(`/category-nominee/nominate`, {
      categoryId,
      gameId,
    });
  }

  /**
   * Retirer une nomination
   */
  async removeNomination(categoryId: number, gameId: number): Promise<void> {
    await apiClient.delete(
      `/category-nominee/remove/${categoryId}/${gameId}`
    );
  }
}

export const categoryNomineeService = new CategoryNomineeService();
