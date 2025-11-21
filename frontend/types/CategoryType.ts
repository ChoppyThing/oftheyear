export enum CategoryPhase {
  Nomination = 'nomination',
  Vote = 'vote',
  Closed = 'closed',
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  year: number;
  phase: CategoryPhase;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    pseudo: string;
    email: string;
  };
  _count?: {
    votes: number;
    nominees: number;
  };
}

export interface CategoriesListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  year?: number;
  phase?: CategoryPhase | '';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateCategoryDto {
  name: string;
  year: number;
  phase?: CategoryPhase;
}

export interface UpdateCategoryDto {
  name?: string;
  year?: number;
  phase?: CategoryPhase;
}

export interface CategoryStats {
  category: Category;
  stats: {
    totalVotes: number;
    totalNominees: number;
  };
}

export interface CategoryVoteStats {
  categoryId: number;
  categoryName: string;
  totalVotes: number;
  nominees: {
    id: number;
    gameId: number;
    gameName: string;
    voteCount: number;
    percentage: number;
  }[];
}

export interface VotePhaseOverview {
  totalCategories: number;
  totalVotes: number;
  categories: CategoryVoteStats[];
}

export interface VotePhaseStats {
  categoryId: number;
  categoryName: string;
  year: number;
  phase: string;
  totalVotes: number;
  nominationVotes: number;
  finalVotes: number;
  games: Array<{
    gameId: number;
    gameName: string;
    voteCount: number;
    percentage: number;
  }>;
}

export interface VotePhaseStatsResponse {
  year: number;
  totalCategories: number;
  totalVotes: number;
  categories: VotePhaseStats[];
}
