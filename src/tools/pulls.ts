import { octokit } from "../github";

export async function listPullRequests(args: {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  limit?: number;
}) {
  const { data } = await octokit.rest.pulls.list({
    owner: args.owner,
    repo: args.repo,
    state: args.state || "open",
    per_page: args.limit || 20,
  });

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    author: pr.user?.login,
    head: pr.head.ref,
    base: pr.base.ref,
    draft: pr.draft,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    url: pr.html_url,
  }));
}

export async function getPullRequest(args: {
  owner: string;
  repo: string;
  pull_number: number;
}) {
  const { data } = await octokit.rest.pulls.get({
    owner: args.owner,
    repo: args.repo,
    pull_number: args.pull_number,
  });

  return {
    number: data.number,
    title: data.title,
    state: data.state,
    author: data.user?.login,
    head: data.head.ref,
    base: data.base.ref,
    draft: data.draft,
    mergeable: data.mergeable,
    merged: data.merged,
    created_at: data.created_at,
    updated_at: data.updated_at,
    url: data.html_url,
    body: data.body,
    additions: data.additions,
    deletions: data.deletions,
    changed_files: data.changed_files,
  };
}

export async function createPullRequest(args: {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
}) {
  const { data } = await octokit.rest.pulls.create({
    owner: args.owner,
    repo: args.repo,
    title: args.title,
    head: args.head,
    base: args.base,
    body: args.body,
    draft: args.draft,
  });

  return {
    number: data.number,
    title: data.title,
    url: data.html_url,
    state: data.state,
    draft: data.draft,
  };
}
