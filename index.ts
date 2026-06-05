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
