import { octokit } from "../github";

export async function listIssues(args: {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  limit?: number;
}) {
  const { data } = await octokit.rest.issues.listForRepo({
    owner: args.owner,
    repo: args.repo,
    state: args.state || "open",
    per_page: args.limit || 20,
  });

  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      author: issue.user?.login,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((l) => (typeof l === "string" ? l : l.name)),
      url: issue.html_url,
      body: issue.body,
    }));
}

export async function getIssue(args: {
  owner: string;
  repo: string;
  issue_number: number;
}) {
  const { data } = await octokit.rest.issues.get({
    owner: args.owner,
    repo: args.repo,
    issue_number: args.issue_number,
  });

  return {
    number: data.number,
    title: data.title,
    state: data.state,
    author: data.user?.login,
    created_at: data.created_at,
    updated_at: data.updated_at,
    labels: data.labels.map((l) => (typeof l === "string" ? l : l.name)),
    url: data.html_url,
    body: data.body,
    comments: data.comments,
  };
}

export async function createIssue(args: {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
}) {
  const { data } = await octokit.rest.issues.create({
    owner: args.owner,
    repo: args.repo,
    title: args.title,
    body: args.body,
    labels: args.labels,
  });

  return {
    number: data.number,
    title: data.title,
    url: data.html_url,
    state: data.state,
  };
}
