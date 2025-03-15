import * as arctic from "arctic";

import { env } from "~/config/env";

class GithubClient {
  private github = new arctic.GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    null
  );
  createAuthorizationURL(state: string) {
    const url = this.github.createAuthorizationURL(state, ["read:user"]);
    return url.toString();
  }
  async getAccessToken(code: string) {
    const tokens = await this.github.validateAuthorizationCode(code);
    return tokens.accessToken();
  }
  async getUser(token: string) {
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await response.json();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.avatar_url,
    };
  }
}

export const github = new GithubClient();
