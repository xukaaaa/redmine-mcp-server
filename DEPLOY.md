# Deployment Guide - Node.js Version

## Prerequisites

- Node.js 18+
- Vercel account (free tier works)
- Redmine instance with API access

## Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Clone and Setup

```bash
git clone https://github.com/xukaaaa/redmine-mcp-server.git
cd redmine-mcp-server
git checkout nodejs-vercel
npm install
```

### 3. Configure Environment Variables

```bash
# Add production environment variables
vercel env add REDMINE_URL production
# Enter: https://your-redmine-instance.com

vercel env add REDMINE_API_KEY production
# Enter: your-api-key-here

# Optional: Add for preview deployments
vercel env add REDMINE_URL preview
vercel env add REDMINE_API_KEY preview
```

### 4. Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

You'll get a URL like: `https://redmine-mcp-server-xxxx.vercel.app`

### 5. Test Your Deployment

```bash
curl https://your-app.vercel.app
```

You should see the MCP server responding.

## Configure MCP Clients

### Claude Code

```bash
claude mcp add --transport http redmine https://your-app.vercel.app
claude
```

### Cursor

Create `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "redmine": {
      "url": "https://your-app.vercel.app"
    }
  }
}
```

### VS Code + Copilot

1. Command Palette: `MCP: Add Server`
2. Transport: `HTTP`
3. URL: `https://your-app.vercel.app`
4. Name: `Redmine`

## Environment Variables

Required in Vercel:
- `REDMINE_URL` - Your Redmine base URL
- `REDMINE_API_KEY` - Your Redmine API key

## Architecture

```
┌─────────────────┐
│  MCP Client     │
│ (Claude/Cursor) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│ Vercel Serverless│
│ (Edge Function) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redmine API     │
└─────────────────┘
```

## Troubleshooting

### Build Errors

```bash
# Check build locally
npm run build

# View Vercel logs
vercel logs
```

### Environment Variables Not Working

```bash
# List all env vars
vercel env ls

# Pull env vars locally for testing
vercel env pull .env.local
```

### CORS Issues

Vercel MCP adapter handles CORS automatically. If you encounter issues, check that you're using the correct URL.

### Cold Starts

- Free tier has cold starts (~1-2 seconds)
- Upgrade to Pro for "Always On" functions
- Or accept the cold start delay

## Monitoring

### View Logs

```bash
vercel logs your-project-name
```

### Check Deployment Status

```bash
vercel ls
```

### Inspect Function

Visit: `https://vercel.com/dashboard`

## Cost

**Vercel Free Tier:**
- 100GB bandwidth/month
- 100 hours serverless function execution/month
- Perfect for personal use

**Vercel Pro ($20/month):**
- 1TB bandwidth
- Unlimited function executions
- "Always On" functions
- Better for team use

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use Vercel environment variables for secrets
3. ✅ Keep Redmine API key secure
4. ✅ Use HTTPS only (Vercel enforces this)
5. ✅ Rotate API keys regularly

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Configure DNS records
4. Your MCP endpoint: `https://mcp.yourdomain.com`

## Updates

When you update code:

```bash
git pull origin nodejs-vercel
npm install
vercel --prod
```

Vercel automatically rebuilds and deploys.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Redmine API Docs](https://www.redmine.org/projects/redmine/wiki/Rest_api)
