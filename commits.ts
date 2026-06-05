import { octokit } from "../github";

export async function getCommits(args: {
  owner: string;
  repo: string;
  branch?: string;
  limit?: number;
}) {
  const { data } = await octokit.rest.repos.listCommits({
    owner: args.owner,
    repo: args.repo,
    sha: args.branch,
    per_page: args.limit || 20,
  });

  return data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name,
    date: commit.commit.author?.date,
    url: commit.html_url,
  }));
}
