import * as arctic from "arctic";

import { env } from "~/config/env";

const arcticGithubApi = new arctic.GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  null
);

function createAuthorizationURL(state: string) {
  const url = arcticGithubApi.createAuthorizationURL(state, ["read:user"]);
  return url.toString();
}
async function getAccessToken(code: string) {
  const tokens = await arcticGithubApi.validateAuthorizationCode(code);
  return tokens.accessToken();
}
async function getUser(token: string) {
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

export const github = { createAuthorizationURL, getAccessToken, getUser };
