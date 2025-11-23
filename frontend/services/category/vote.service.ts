import { apiClient } from '@/lib/api-client';
import { CategoryVote, MyVoteResponse, VotedCategory } from '@/types/VoteType';

export const categoryVoteService = {
  // Voter pour un jeu
  async vote(categorySlug: string, gameId: number, year: number): Promise<CategoryVote> {
    return apiClient.post<CategoryVote>(
      `/category-vote/category/${categorySlug}/vote?year=${year}`,
      { gameId }
    );
  },

  // Récupérer mon vote
  async getMyVote(categorySlug: string, year: number): Promise<MyVoteResponse | null> {
    try {
      return await apiClient.get<MyVoteResponse>(
        `/category-vote/category/${categorySlug}/my-vote?year=${year}`
      );
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  // Retirer mon vote
  async removeVote(categorySlug: string, year: number): Promise<void> {
    return apiClient.delete<void>(
      `/category-vote/category/${categorySlug}/vote?year=${year}`
    );
  },

  // Liste des catégories que j'ai votées
  async getMyVotedCategories(year: number): Promise<VotedCategory[]> {
    return apiClient.get<VotedCategory[]>(
      `/category-vote/my-voted-categories?year=${year}`
    );
  },
};
