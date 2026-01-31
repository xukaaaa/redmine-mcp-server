# Migration Guide: Python to Node.js

## Why Node.js Version?

The Node.js version offers several advantages for Vercel deployment:

### Advantages
✅ **Native Vercel Support** - No ASGI adapter needed
✅ **Faster Cold Starts** - Edge Functions vs Python serverless
✅ **Better TypeScript Support** - Full IDE autocomplete
✅ **Simpler Deployment** - One-click Vercel deploy
✅ **Better Ecosystem** - npm packages for MCP

### When to Use Each Version

**Use Python version (main branch):**
- You prefer Python
- Running locally with STDIO transport
- Deploying to Google Cloud Run / AWS Lambda
- Already have Python infrastructure

**Use Node.js version (nodejs-vercel branch):**
- Deploying to Vercel
- Want fastest cold starts
- Prefer TypeScript
- Want one-click deployment

## Code Comparison

### Python (main branch)
```python
# src/redmine_mcp_server/server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Redmine Helper")

@mcp.tool()
def list_my_tasks(status_filter: str = "open") -> str:
    issues = api_request("GET", "/issues.json?assigned_to_id=me")
    # ...
```

### Node.js (nodejs-vercel branch)
```typescript
// api/mcp/route.ts
import { createMcpHandler } from '@vercel/mcp-adapter';

const handler = createMcpHandler((server) => {
  server.tool('list_my_tasks', 'List tasks', schema, async ({ status_filter }) => {
    const issues = await redmineClient.getMyIssues(status_filter);
    // ...
  });
});
```

## Migration Steps

If you're currently using the Python version and want to switch:

### 1. Switch to Node.js branch
```bash
git checkout nodejs-vercel
npm install
```

### 2. Update Environment Variables
Same variables, different location:
```bash
# Before (Python - local .env)
export REDMINE_URL="..."
export REDMINE_API_KEY="..."

# After (Node.js - Vercel dashboard)
vercel env add REDMINE_URL
vercel env add REDMINE_API_KEY
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Update MCP Clients
```bash
# Before (Python STDIO)
# In claude_desktop_config.json:
{
  "mcpServers": {
    "redmine": {
      "command": "redmine-mcp-server"
    }
  }
}

# After (Node.js HTTP)
claude mcp add --transport http redmine https://your-app.vercel.app
```

## API Compatibility

Both versions expose the **same 8 tools**:

1. `list_my_tasks` - List assigned tasks
2. `get_issue_details` - Get issue details
3. `log_time` - Log time entry
4. `update_issue_status` - Change status
5. `update_progress` - Update % complete
6. `add_note` - Add comment
7. `get_today_logs` - View today's logs
8. `get_time_logs_range` - View logs in date range

Tool names and parameters are **100% compatible**.

## Performance Comparison

| Metric | Python (main) | Node.js (nodejs-vercel) |
|--------|---------------|-------------------------|
| Cold Start | ~2-3s | ~500ms-1s |
| Warm Response | ~100ms | ~50ms |
| Deploy Time | 2-3 min | 30-60s |
| Bundle Size | ~50MB | ~5MB |

## Deployment Comparison

### Python Version
```bash
# Requires manual setup
pip install -r requirements.txt
python3 run_http.py
# OR deploy to Cloud Run/AWS
```

### Node.js Version
```bash
# One command
vercel --prod
```

## Support

Both versions are maintained:
- **Python (main)**: For local/custom deployments
- **Node.js (nodejs-vercel)**: For Vercel deployments

Choose based on your infrastructure preference.
