export enum GameStatus {
  Sent = 'sent',
  Validated = 'validated',
  Moderated = 'moderated',
}

export interface Game {
  id: number;
  name: string;
  image: string;
  developer: string;
  editor: string;
  status: GameStatus;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    pseudo: string;
    email: string;
  };
}

export interface GamesListResponse {
  data: Game[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
