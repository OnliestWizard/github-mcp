import { octokit, getAuthenticatedUser } from "../github";

export async function searchCode(args: {
  query: string;
  repo?: string;
  language?: string;
  limit?: number;
}) {
  const user = await getAuthenticatedUser();

  let q = args.query;
  if (args.repo) q += ` repo:${args.repo}`;
  else q += ` user:${user.login}`;
  if (args.language) q += ` language:${args.language}`;

  const { data } = await octokit.rest.search.code({
    q,
    per_page: args.limit || 10,
  });

  return {
    total_count: data.total_count,
    results: data.items.map((item) => ({
      name: item.name,
      path: item.path,
      repo: item.repository.full_name,
      url: item.html_url,
      sha: item.sha,
    })),
  };
}
