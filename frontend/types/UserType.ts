export interface User {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  roles: string[];
  isVerified: boolean;
}