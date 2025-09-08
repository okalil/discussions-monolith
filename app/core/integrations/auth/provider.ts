export interface AuthProvider {
  createAuthorizationURL(state: string): string;
  getAccessToken(code: string): Promise<string>;
  getUser(token: string): Promise<AuthProviderUser>;
}

interface AuthProviderUser {
  id: string;
  name: string;
  image: string;
  email: string;
  emailVerified?: boolean;
}
