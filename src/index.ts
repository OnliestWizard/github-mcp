#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listRepos, getRepo } from "./tools/repos";
import { getFile, getTree, getReadme } from "./tools/files";
import { getCommits } from "./tools/commits";
import { searchCode } from "./tools/search";
import { listIssues, getIssue, createIssue } from "./tools/issues";
import { listPullRequests, getPullRequest, createPullRequest } from "./tools/pulls";
import { getSession, setDefault } from "./session";

const server = new Server(
  { name: "github-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_repos",
      description: "List all repositories for the authenticated GitHub user",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["all", "owner", "public", "private", "forks"],
            description: "Filter by repo type (default: all)",
          },
          sort: {
            type: "string",
            enum: ["created", "updated", "pushed", "full_name"],
            description: "Sort order (default: updated)",
          },
        },
      },
    },
    {
      name: "get_repo",
      description: "Get metadata and details for a specific repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_file",
      description: "Read the contents of a file in a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          path: { type: "string", description: "File path within the repo" },
          branch: { type: "string", description: "Branch name (default: main)" },
        },
        required: ["owner", "repo", "path"],
      },
    },
    {
      name: "get_tree",
      description: "Get the full file/directory tree of a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          branch: { type: "string", description: "Branch name (default: main)" },
          recursive: {
            type: "boolean",
            description: "Recursively get all files (default: false)",
          },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_readme",
      description: "Get the README file for a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_commits",
      description: "Get commit history for a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          branch: { type: "string", description: "Branch name (default: main)" },
          limit: {
            type: "number",
            description: "Number of commits to return (default: 20)",
          },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "search_code",
      description: "Search for code across your GitHub repositories",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          repo: {
            type: "string",
            description: "Limit to specific repo (owner/repo format)",
          },
          language: { type: "string", description: "Filter by language" },
          limit: {
            type: "number",
            description: "Number of results (default: 10)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "list_issues",
      description: "List issues for a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          state: {
            type: "string",
            enum: ["open", "closed", "all"],
            description: "Filter by state (default: open)",
          },
          limit: { type: "number", description: "Number of issues to return (default: 20)" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_issue",
      description: "Get details for a specific issue",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          issue_number: { type: "number", description: "Issue number" },
        },
        required: ["owner", "repo", "issue_number"],
      },
    },
    {
      name: "create_issue",
      description: "Create a new issue in a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          title: { type: "string", description: "Issue title" },
          body: { type: "string", description: "Issue body/description" },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "Labels to apply",
          },
        },
        required: ["owner", "repo", "title"],
      },
    },
    {
      name: "list_pull_requests",
      description: "List pull requests for a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          state: {
            type: "string",
            enum: ["open", "closed", "all"],
            description: "Filter by state (default: open)",
          },
          limit: { type: "number", description: "Number of PRs to return (default: 20)" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_pull_request",
      description: "Get details for a specific pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          pull_number: { type: "number", description: "Pull request number" },
        },
        required: ["owner", "repo", "pull_number"],
      },
    },
    {
      name: "get_session",
      description: "Get current session state — shows authenticated user and any saved defaults",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "set_context",
      description: "Save a default owner or repo so you don't have to specify it every call",
      inputSchema: {
        type: "object",
        properties: {
          defaultOwner: { type: "string", description: "Default GitHub username/org" },
          defaultRepo: { type: "string", description: "Default repository name" },
        },
      },
    },
    {
      name: "create_pull_request",
      description: "Create a new pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner/username" },
          repo: { type: "string", description: "Repository name" },
          title: { type: "string", description: "PR title" },
          head: { type: "string", description: "Branch to merge from" },
          base: { type: "string", description: "Branch to merge into" },
          body: { type: "string", description: "PR description" },
          draft: { type: "boolean", description: "Open as draft PR" },
        },
        required: ["owner", "repo", "title", "head", "base"],
      },
    },
  ],
}));

// Tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "list_repos":
        result = await listRepos(args as any);
        break;
      case "get_repo":
        result = await getRepo(args as any);
        break;
      case "get_file":
        result = await getFile(args as any);
        break;
      case "get_tree":
        result = await getTree(args as any);
        break;
      case "get_readme":
        result = await getReadme(args as any);
        break;
      case "get_commits":
        result = await getCommits(args as any);
        break;
      case "search_code":
        result = await searchCode(args as any);
        break;
      case "list_issues":
        result = await listIssues(args as any);
        break;
      case "get_issue":
        result = await getIssue(args as any);
        break;
      case "create_issue":
        result = await createIssue(args as any);
        break;
      case "list_pull_requests":
        result = await listPullRequests(args as any);
        break;
      case "get_pull_request":
        result = await getPullRequest(args as any);
        break;
      case "create_pull_request":
        result = await createPullRequest(args as any);
        break;
      case "get_session":
        result = getSession() ?? { message: "No session yet — run any tool to initialize" };
        break;
      case "set_context": {
        const a = args as { defaultOwner?: string; defaultRepo?: string };
        if (a.defaultOwner) setDefault("defaultOwner", a.defaultOwner);
        if (a.defaultRepo) setDefault("defaultRepo", a.defaultRepo);
        result = getSession();
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("github-mcp running");
}

main().catch(console.error);
