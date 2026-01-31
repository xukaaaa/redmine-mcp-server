/**
 * Vercel API Route - MCP Server Endpoint
 * Handles all MCP protocol requests via HTTP
 */

import { createMcpHandler } from '@vercel/mcp-adapter';
import { RedmineClient } from '../../src/redmine-client.js';
import { createTools } from '../../src/tools.js';

// Get configuration from environment variables
const REDMINE_URL = process.env.REDMINE_URL;
const REDMINE_API_KEY = process.env.REDMINE_API_KEY;

if (!REDMINE_URL || !REDMINE_API_KEY) {
  throw new Error(
    'Missing required environment variables: REDMINE_URL and REDMINE_API_KEY'
  );
}

// Initialize Redmine client
const redmineClient = new RedmineClient({
  baseUrl: REDMINE_URL,
  apiKey: REDMINE_API_KEY,
});

// Create tools
const tools = createTools(redmineClient);

// Create MCP handler for Vercel
const handler = createMcpHandler((server) => {
  // Register all tools
  for (const [name, tool] of Object.entries(tools)) {
    server.tool(name, tool.description, tool.parameters, tool.execute);
  }
});

// Export for Vercel
export { handler as GET, handler as POST, handler as DELETE };
