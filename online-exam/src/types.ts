export type UserRole = 'student' | 'instructor' | 'admin' | null;

export interface JwtPayload {
  id: string;
  role: UserRole;
  exp: number;
}
