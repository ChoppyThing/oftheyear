export enum CategoryPhase {
  Nomination = 'nomination',
  Vote = 'vote',
  Closed = 'closed',
}

export interface Category {
  id: number;
  name: string;
  description?: string; 
  slug: string;
  sort?: number;
  forceFiltered?: boolean;
  translations?: {
    fr?: { title?: string; description?: string };
    en?: { title?: string; description?: string };
    es?: { title?: string; description?: string };
    zh?: { title?: string; description?: string };
  };
  phase: CategoryPhase;
  year: number;
  icon?: string;
  gamesCount?: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    // these fields are optional and provided by some API responses
    pseudo?: string;
    email?: string;
  };

  // optional counts returned by some endpoints (e.g. _count.votes, _count.nominees)
  _count?: {
    votes?: number;
    nominees?: number;
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
  sort?: number;
  translations?: {
    fr?: { title?: string; description?: string };
    en?: { title?: string; description?: string };
    es?: { title?: string; description?: string };
    zh?: { title?: string; description?: string };
  };
}

export interface UpdateCategoryDto {
  name?: string;
  year?: number;
  phase?: CategoryPhase;
  sort?: number;
  translations?: {
    fr?: { title?: string; description?: string };
    en?: { title?: string; description?: string };
    es?: { title?: string; description?: string };
    zh?: { title?: string; description?: string };
  };
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
  phase: CategoryPhase;
  totalVotes: number;
  nominationVotes?: {
    id: number;
    gameId: number;
    gameName: string;
    voteCount: number;
    percentage: number;
  }[];
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
  totalCategories: number;
  totalVotes: number;
  categories: CategoryVoteStats[];
}
