import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as path from "path";
import { saveSession } from "./session";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const token = process.env.GITHUB_PAT;

if (!token) {
  throw new Error("GITHUB_PAT not set in environment");
}

export const octokit = new Octokit({ auth: token });

let _cachedUser: Awaited<ReturnType<typeof octokit.rest.users.getAuthenticated>>["data"] | null = null;

export async function getAuthenticatedUser() {
  if (_cachedUser) return _cachedUser;
  const { data } = await octokit.rest.users.getAuthenticated();
  _cachedUser = data;
  saveSession({ login: data.login });
  return data;
}
