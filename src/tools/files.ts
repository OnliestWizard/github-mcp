import { octokit } from "../github";

export async function getFile(args: {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
}) {
  const { data } = await octokit.rest.repos.getContent({
    owner: args.owner,
    repo: args.repo,
    path: args.path,
    ref: args.branch,
  });

  if (Array.isArray(data)) {
    throw new Error(`Path ${args.path} is a directory, not a file`);
  }

  if (data.type !== "file" || !("content" in data)) {
    throw new Error(`Could not read file at ${args.path}`);
  }

  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path: data.path,
    name: data.name,
    size: data.size,
    content,
    sha: data.sha,
    url: data.html_url,
  };
}

export async function getTree(args: {
  owner: string;
  repo: string;
  branch?: string;
  recursive?: boolean;
}) {
  const repo = await octokit.rest.repos.get({
    owner: args.owner,
    repo: args.repo,
  });

  const branch = args.branch || repo.data.default_branch;

  const { data } = await octokit.rest.git.getTree({
    owner: args.owner,
    repo: args.repo,
    tree_sha: branch,
    recursive: args.recursive ? "1" : undefined,
  });

  return {
    sha: data.sha,
    truncated: data.truncated,
    tree: data.tree.map((item) => ({
      path: item.path,
      type: item.type,
      size: item.size,
    })),
  };
}

export async function getReadme(args: { owner: string; repo: string }) {
  const { data } = await octokit.rest.repos.getReadme({
    owner: args.owner,
    repo: args.repo,
  });

  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path: data.path,
    content,
    size: data.size,
    url: data.html_url,
  };
}
