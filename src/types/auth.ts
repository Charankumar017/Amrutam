export interface Session {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
