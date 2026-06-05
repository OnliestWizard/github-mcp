import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_PAT;

if (!token) {
  throw new Error("GITHUB_PAT not set in environment");
}

export const octokit = new Octokit({ auth: token });

export async function getAuthenticatedUser() {
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}
