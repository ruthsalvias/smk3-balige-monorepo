export interface JwtPayload {
  sub: string;
  username: string;
  nama?: string;
  roles?: string[];
}

export interface AuthUser {
  sub: string;
  username: string;
  nama: string;
  email?: string;
  roles: string[];
}
