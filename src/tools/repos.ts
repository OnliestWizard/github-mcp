import { octokit, getAuthenticatedUser } from "../github";

export async function listRepos(args: { type?: string; sort?: string }) {
  const user = await getAuthenticatedUser();
  const { data } = await octokit.rest.repos.listForUser({
    username: user.login,
    type: (args.type as any) || "all",
    sort: (args.sort as any) || "updated",
    per_page: 100,
  });

  return data.map((repo) => ({
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    language: repo.language,
    private: repo.private,
    stars: repo.stargazers_count,
    updated_at: repo.updated_at,
    url: repo.html_url,
  }));
}

export async function getRepo(args: { owner: string; repo: string }) {
  const { data } = await octokit.rest.repos.get({
    owner: args.owner,
    repo: args.repo,
  });

  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    language: data.language,
    private: data.private,
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    default_branch: data.default_branch,
    created_at: data.created_at,
    updated_at: data.updated_at,
    url: data.html_url,
    topics: data.topics,
  };
}
