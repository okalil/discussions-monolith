import * as arctic from "arctic";

import { env } from "~/config/env.server";

import type { OAuthProvider } from "../provider";

const arcticGithubApi = new arctic.GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  null
);

class GithubOAuthProvider implements OAuthProvider {
  createAuthorizationURL(state: string) {
    const url = arcticGithubApi.createAuthorizationURL(state, ["read:user"]);
    return url.toString();
  }
  async getAccessToken(code: string) {
    const tokens = await arcticGithubApi.validateAuthorizationCode(code);
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
    const email = emails.find((email) => email.primary)?.email;

    if (!email) throw new Error("Email not found");

    return {
      id: user.id.toString(),
      name: user.name,
      image: user.avatar_url,
      email,
    };
  }
}

export const github = new GithubOAuthProvider();

interface GithubUser {
  id: number;
  name: string;
  avatar_url: string;
}
interface GithubEmail {
  email: string;
  primary: boolean;
}
