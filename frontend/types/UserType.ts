export interface User {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
