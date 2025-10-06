export interface JwtPayload {
  sub: string; // user id
  id?: string; // alias for sub
  email: string;
  role: string;
}
