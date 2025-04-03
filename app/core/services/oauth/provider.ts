export interface OAuthProvider {
  createAuthorizationURL(state: string): string;
  getAccessToken(code: string): Promise<string>;
  getUser(
    token: string
  ): Promise<{ id: string; name: string; image: string; email: string }>;
}
