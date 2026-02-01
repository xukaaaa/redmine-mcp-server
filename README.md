# Redmine MCP Server

MCP (Model Context Protocol) Server for Redmine - Manage tasks, log time, update status via Claude/AI assistants.

**Deployed on Vercel**: https://redmine-mcp-server.vercel.app

## Features

- **List Tasks** - View tasks assigned to you with status filtering
- **Task Details** - Get detailed information about specific issues
- **Log Time** - Record time entries with comments
- **Update Status** - Change issue status (in progress, resolved, etc.)
- **Update Progress** - Set completion percentage (0-100%)
- **Add Notes** - Add comments to issues
- **Daily Summary** - Check today's logged hours
- **Time Logs Range** - View logged hours within a date range

## Quick Start

### 1. Get Your Redmine API Key

1. Log in to your Redmine instance
2. Go to **My Account** (top right)
3. Find **API access key** on the right sidebar
4. Click **Show** or **Reset** to get your key

### 2. Configure in Cursor/Claude Code

#### Cursor

Edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "redmine": {
      "url": "https://redmine-mcp-server.vercel.app/api/mcp?redmine_url=https://your-redmine.com&api_key=YOUR_API_KEY"
    }
  }
}
```

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "redmine": {
      "transport": {
        "type": "http",
        "url": "https://redmine-mcp-server.vercel.app/api/mcp?redmine_url=https://your-redmine.com&api_key=YOUR_API_KEY"
      }
    }
  }
}
```

#### CLI

```bash
claude mcp add --transport http redmine "https://redmine-mcp-server.vercel.app/api/mcp?redmine_url=https://your-redmine.com&api_key=YOUR_API_KEY"
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|-----------|
| `list_my_tasks` | List tasks assigned to you | `status_filter`: open/closed/all |
| `get_issue_details` | Get detailed info about an issue | `issue_id`: number |
| `log_time` | Log time entry | `issue_id`, `hours`, `comment`, `activity_id` (opt), `spent_on` (opt) |
| `update_issue_status` | Change issue status | `issue_id`, `status_id` |
| `update_progress` | Update completion percentage | `issue_id`, `percent` (0-100) |
| `add_note` | Add a comment to an issue | `issue_id`, `note` |
| `get_today_logs` | View today's time entries | - |
| `get_time_logs_range` | View time logs by date range | `from_date`, `to_date` (YYYY-MM-DD) |

## Examples

Ask Claude:

- "Show me my open tasks"
- "What's the status of issue #123?"
- "Log 2 hours on task #456 for code review"
- "Mark issue #789 as resolved"
- "Update task #101 to 80% complete"
- "How many hours have I logged today?"
- "Show me my time logs from 2025-01-20 to 2025-01-31"

## Multi-tenant Architecture

This server supports **multi-tenant** usage via URL parameters:

```
https://redmine-mcp-server.vercel.app/api/mcp?redmine_url=YOUR_URL&api_key=YOUR_KEY
```

Each user provides their own:
- `redmine_url`: Your Redmine instance URL
- `api_key`: Your Redmine API key

**No fallback to environment variables** - credentials must be provided in URL params.

## Development

### Local Setup

```bash
# Clone the repo
git clone https://github.com/xukaaaa/redmine-mcp-server.git
cd redmine-mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally (requires mcp-handler setup)
npm run dev
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: JavaScript (ES modules)
- **MCP Handler**: mcp-handler
- **Validation**: Zod
- **Deployment**: Vercel Serverless Functions
- **Transport**: HTTP (Streamable HTTP/SSE)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**xukaaaa** - [GitHub](https://github.com/xukaaaa)
