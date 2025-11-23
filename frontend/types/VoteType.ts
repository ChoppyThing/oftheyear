export interface CategoryVote {
  id: number;
  gameId: number;
  userId: number;
  categoryId: number;
  createdAt: string;
}

export interface MyVoteResponse {
  gameId: number | null;
}

export interface VotedCategory {
  id: number;
  name: string;
  slug: string;
  gameId: number;
  gameName: string;
  gameCoverUrl?: string;
}
