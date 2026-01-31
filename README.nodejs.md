# Redmine MCP Server (Node.js + Vercel)

MCP (Model Context Protocol) Server for Redmine - Deploy to Vercel with HTTP transport.

## Features

- **List Tasks** - View tasks assigned to you with status filtering
- **Task Details** - Get detailed information about specific issues
- **Log Time** - Record time entries with comments
- **Update Status** - Change issue status
- **Update Progress** - Set completion percentage (0-100%)
- **Add Notes** - Add comments to issues
- **Daily Summary** - Check today's logged hours
- **Time Logs Range** - View logged hours within a date range

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xukaaaa/redmine-mcp-server&env=REDMINE_URL,REDMINE_API_KEY&envDescription=Redmine%20connection%20settings&project-name=redmine-mcp-server)

### Manual Deploy

1. **Clone and install:**
   ```bash
   git clone https://github.com/xukaaaa/redmine-mcp-server.git
   cd redmine-mcp-server
   git checkout nodejs-vercel
   npm install
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set environment variables:**
   ```bash
   vercel env add REDMINE_URL production
   # Enter: https://your-redmine-instance.com

   vercel env add REDMINE_API_KEY production
   # Enter: your-api-key
   ```

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

Your MCP server will be available at: `https://your-app.vercel.app`

## Configuration

### Getting your Redmine API Key

1. Log in to your Redmine instance
2. Go to **My Account** (top right)
3. Find **API access key** on the right sidebar
4. Click **Show** or **Reset** to get your key

### Environment Variables

Required:
- `REDMINE_URL` - Your Redmine instance URL (e.g., `https://redmine.example.com`)
- `REDMINE_API_KEY` - Your Redmine API key

## Usage

### With Claude Code

```bash
claude mcp add --transport http redmine https://your-app.vercel.app
```

Then start Claude:
```bash
claude
```

### With Cursor

Create or edit `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "redmine": {
      "url": "https://your-app.vercel.app"
    }
  }
}
```

### With VS Code + Copilot

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Run `MCP: Add Server`
3. Select `HTTP`
4. Enter:
   - URL: `https://your-app.vercel.app`
   - Name: `Redmine`

### With AI SDK (TypeScript/JavaScript)

```typescript
import { createMCPClient } from '@ai-sdk/mcp';

const mcpClient = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://your-app.vercel.app',
  },
});

// List tools
const tools = await mcpClient.listTools();

// Call a tool
const result = await mcpClient.callTool({
  name: 'list_my_tasks',
  arguments: { status_filter: 'open' },
});
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_my_tasks` | List tasks assigned to you (filter: open/closed/all) |
| `get_issue_details` | Get detailed info about a specific issue |
| `log_time` | Log time entry with hours and comment |
| `update_issue_status` | Change issue status by ID |
| `update_progress` | Update completion percentage |
| `add_note` | Add a comment to an issue |
| `get_today_logs` | View today's time entries and total hours |
| `get_time_logs_range` | View time logs within a date range (from_date, to_date) |

## Examples

Ask Claude:

- "Show me my open tasks"
- "What's the status of issue #123?"
- "Log 2 hours on task #456 for code review"
- "Update task #789 to status ID 3 (Resolved)"
- "Set task #101 to 80% complete"
- "How many hours have I logged today?"
- "Show me my time logs from 2025-01-01 to 2025-01-31"

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export REDMINE_URL="https://your-redmine-instance.com"
export REDMINE_API_KEY="your-api-key"

# Run dev server
npm run dev
```

## Project Structure

```
redmine-mcp-server/
├── api/
│   └── mcp/
│       └── route.ts          # Vercel API endpoint
├── src/
│   ├── redmine-client.ts     # Redmine API client
│   └── tools.ts              # MCP tools implementation
├── package.json
├── tsconfig.json
├── vercel.json              # Vercel configuration
└── README.md
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**xukaaaa** - [GitHub](https://github.com/xukaaaa)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- [MCP Documentation](https://modelcontextprotocol.io)
- [Vercel Documentation](https://vercel.com/docs)
- [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)
