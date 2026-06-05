# github-mcp

A GitHub MCP server that connects your repos directly to Claude.

## Install

```bash
npm install -g github-mcp
```

## Setup

1. Generate a GitHub Personal Access Token:
   - GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Scopes needed: `repo`, `read:user`

2. Create a `.env` file:
```bash
cp .env.example .env
# Add your token
GITHUB_PAT=your_token_here
```

## Run

```bash
github-mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `list_repos` | List all your repositories |
| `get_repo` | Get metadata for a specific repo |
| `get_file` | Read any file by path |
| `get_tree` | Full directory tree of a repo |
| `get_readme` | Get a repo's README |
| `get_commits` | Commit history |
| `search_code` | Search code across your repos |

## Use with Claude Code

Add to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "github": {
      "command": "github-mcp",
      "env": {
        "GITHUB_PAT": "your_token_here"
      }
    }
  }
}
```

## License

MIT
