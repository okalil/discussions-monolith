import * as arctic from "arctic";

import type { AuthProvider } from "../provider";

export class GithubAuthProvider implements AuthProvider {
  private authClient: arctic.GitHub;
  constructor(clientId: string, clientSecret: string) {
    this.authClient = new arctic.GitHub(clientId, clientSecret, null);
  }

  createAuthorizationURL(state: string) {
    const url = this.authClient.createAuthorizationURL(state, ["read:user"]);
    return url.toString();
  }
  async getAccessToken(code: string) {
    const tokens = await this.authClient.validateAuthorizationCode(code);
    return tokens.accessToken();
  }
  async getUser(token: string) {
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user: GithubUser = await userResponse.json();

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const emails: GithubEmail[] = await emailsResponse.json();
    const primaryEmailInfo = emails.find((email) => email.primary);

    if (!primaryEmailInfo) throw new Error("Email not found");

    return {
      id: user.id.toString(),
      name: user.name,
      image: user.avatar_url,
      email: primaryEmailInfo.email,
      emailVerified: primaryEmailInfo.verified,
    };
  }
}

interface GithubUser {
  id: number;
  name: string;
  avatar_url: string;
}
interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}
