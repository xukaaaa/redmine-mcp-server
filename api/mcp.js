/**
 * Vercel API Route - Redmine MCP Server (Multi-tenant via URL params)
 * Path: /api/mcp
 *
 * Usage: /api/mcp?redmine_url=https://your-redmine.com&api_key=your-key
 */

import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

class RedmineClient {
  constructor(config) {
    this.config = config;
  }

  async request(method, endpoint, data) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'X-Redmine-API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
    };
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Redmine API Error ${response.status}: ${errorText}`);
    }
    if (response.status === 204) return {};
    return response.json();
  }

  async getMyIssues(statusFilter = 'open') {
    let endpoint = '/issues.json?assigned_to_id=me&limit=25';
    if (statusFilter === 'open' || statusFilter === 'closed') {
      endpoint += `&status_id=${statusFilter}`;
    }
    const data = await this.request('GET', endpoint);
    return data.issues || [];
  }

  async getIssueDetails(issueId) {
    const data = await this.request('GET', `/issues/${issueId}.json?include=journals,children`);
    return data.issue;
  }

  async logTime(params) {
    const timeEntry = {
      issue_id: params.issue_id,
      hours: params.hours,
      comments: params.comment,
      activity_id: params.activity_id || 9,
      spent_on: params.spent_on || new Date().toISOString().split('T')[0],
    };
    await this.request('POST', '/time_entries.json', { time_entry: timeEntry });
  }

  async updateIssueStatus(issueId, statusId) {
    await this.request('PUT', `/issues/${issueId}.json`, { issue: { status_id: statusId } });
  }

  async updateProgress(issueId, percent) {
    await this.request('PUT', `/issues/${issueId}.json`, { issue: { done_ratio: percent } });
  }

  async addNote(issueId, note) {
    await this.request('PUT', `/issues/${issueId}.json`, { issue: { notes: note } });
  }

  async getTodayLogs() {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.request('GET', `/time_entries.json?user_id=me&from=${today}&to=${today}&limit=100`);
    return data.time_entries || [];
  }

  async getTimeLogsRange(fromDate, toDate) {
    const data = await this.request('GET', `/time_entries.json?user_id=me&from=${fromDate}&to=${toDate}&limit=100`);
    return data.time_entries || [];
  }
}

// Extract credentials from URL params ONLY (no fallback)
function getCredentials(url) {
  const urlObj = new URL(url);
  const redmineUrl = urlObj.searchParams.get('redmine_url');
  const apiKey = urlObj.searchParams.get('api_key');

  if (!redmineUrl || !apiKey) {
    throw new Error('Missing credentials. Provide ?redmine_url=...&api_key=...');
  }

  const baseUrl = redmineUrl.endsWith('/') ? redmineUrl.slice(0, -1) : redmineUrl;
  return { baseUrl, apiKey };
}

// Custom Vercel handler that wraps MCP
export async function GET(request) {
  return handleMcp(request);
}

export async function POST(request) {
  return handleMcp(request);
}

export async function DELETE(request) {
  return handleMcp(request);
}

async function handleMcp(request) {
  try {
    // Extract credentials from URL params
    const credentials = getCredentials(request.url);
    const redmineClient = new RedmineClient(credentials);

    // Create MCP handler with the client configured
    const handler = createMcpHandler(
      (server) => {
        // Tool 1: List my tasks
        server.registerTool('list_my_tasks', {
          title: 'List My Tasks',
          description: 'List tasks assigned to you with status filtering',
          inputSchema: {
            status_filter: z.enum(['open', 'closed', 'all']).default('open').describe('Status filter: open, closed, or all'),
          },
        }, async ({ status_filter }) => {
          try {
            const issues = await redmineClient.getMyIssues(status_filter);
            if (issues.length === 0) return { content: [{ type: 'text', text: '📭 No tasks found.' }] };
            let result = `📋 Tasks (${issues.length}):\n\n`;
            for (const issue of issues) {
              result += `- #${issue.id} [${issue.status.name}] ${issue.done_ratio || 0}%: ${issue.subject}\n`;
              result += `  (Due: ${issue.due_date || 'N/A'} | Project: ${issue.project.name})\n`;
            }
            return { content: [{ type: 'text', text: result }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 2: Get issue details
        server.registerTool('get_issue_details', {
          title: 'Get Issue Details',
          description: 'Get detailed information about a specific issue',
          inputSchema: {
            issue_id: z.number().int().positive().describe('Issue ID'),
          },
        }, async ({ issue_id }) => {
          try {
            const issue = await redmineClient.getIssueDetails(issue_id);
            let result = `#${issue.id} - ${issue.subject}\n\n`;
            result += `Project:    ${issue.project.name}\n`;
            result += `Status:     ${issue.status.name}\n`;
            result += `Progress:   ${issue.done_ratio || 0}%\n`;
            result += `Assigned:   ${issue.assigned_to?.name || 'N/A'}\n`;
            result += `Start date: ${issue.start_date || 'N/A'}\n`;
            result += `Due date:   ${issue.due_date || 'N/A'}\n`;
            result += `Spent:      ${issue.spent_hours || 0}h / Est: ${issue.estimated_hours || 'N/A'}h\n`;

            if (issue.parent) {
              result += `\nParent:     #${issue.parent.id}\n`;
            }

            if (issue.children && issue.children.length > 0) {
              result += `\nSubtasks (${issue.children.length}):\n`;
              for (const child of issue.children) {
                result += `  - #${child.id}: ${child.subject}\n`;
              }
            }

            if (issue.description) {
              const desc = issue.description.substring(0, 500);
              result += `\nDescription:\n${desc}${issue.description.length > 500 ? '...' : ''}\n`;
            }

            return { content: [{ type: 'text', text: result }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 3: Log time
        server.registerTool('log_time', {
          title: 'Log Time Entry',
          description: 'Log time entry on a task',
          inputSchema: {
            issue_id: z.number().int().positive().describe('Issue ID'),
            hours: z.number().positive().describe('Hours spent (e.g., 1.5)'),
            comment: z.string().describe('Work description'),
            activity_id: z.number().int().optional().describe('Activity ID (optional, defaults to 9)'),
            spent_on: z.string().optional().describe('Date in YYYY-MM-DD format (optional, defaults to today)'),
          },
        }, async (params) => {
          try {
            await redmineClient.logTime(params);
            let result = `✅ Logged ${params.hours}h on task #${params.issue_id}\n`;
            result += `   Comment: ${params.comment}`;
            return { content: [{ type: 'text', text: result }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 4: Update issue status
        server.registerTool('update_issue_status', {
          title: 'Update Issue Status',
          description: 'Change issue status',
          inputSchema: {
            issue_id: z.number().int().positive().describe('Issue ID'),
            status_id: z.number().int().positive().describe('Status ID (e.g., 1=New, 2=In Progress, 3=Resolved)'),
          },
        }, async ({ issue_id, status_id }) => {
          try {
            await redmineClient.updateIssueStatus(issue_id, status_id);
            return { content: [{ type: 'text', text: `✅ Updated task #${issue_id} status to ${status_id}` }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 5: Update progress
        server.registerTool('update_progress', {
          title: 'Update Progress',
          description: 'Update task completion percentage (0-100)',
          inputSchema: {
            issue_id: z.number().int().positive().describe('Issue ID'),
            percent: z.number().int().min(0).max(100).describe('Completion percentage (0-100)'),
          },
        }, async ({ issue_id, percent }) => {
          try {
            await redmineClient.updateProgress(issue_id, percent);
            return { content: [{ type: 'text', text: `✅ Updated task #${issue_id} to ${percent}%` }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 6: Add note
        server.registerTool('add_note', {
          title: 'Add Note',
          description: 'Add a comment/note to an issue',
          inputSchema: {
            issue_id: z.number().int().positive().describe('Issue ID'),
            note: z.string().describe('Comment text'),
          },
        }, async ({ issue_id, note }) => {
          try {
            await redmineClient.addNote(issue_id, note);
            return { content: [{ type: 'text', text: `✅ Added note to task #${issue_id}` }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 7: Get today's logs
        server.registerTool('get_today_logs', {
          title: "Get Today's Logs",
          description: "View today's time entries and total hours",
          inputSchema: {},
        }, async () => {
          try {
            const entries = await redmineClient.getTodayLogs();
            const today = new Date().toISOString().split('T')[0];
            const total = entries.reduce((sum, e) => sum + e.hours, 0);

            let result = `📅 Time log for today (${today}):\n\n`;
            for (const entry of entries) {
              const issueId = entry.issue?.id || 'N/A';
              const comment = entry.comments || 'No comment';
              result += `- #${issueId}: ${entry.hours}h (${comment})\n`;
            }

            result += `\n⏱️  Total: ${total}h\n`;
            if (total < 8) {
              result += `⚠️  Need ${8 - total}h more to reach 8h.\n`;
            } else {
              result += '✅ Logged enough hours!\n';
            }

            return { content: [{ type: 'text', text: result }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });

        // Tool 8: Get time logs range
        server.registerTool('get_time_logs_range', {
          title: 'Get Time Logs Range',
          description: 'View time logs within a date range',
          inputSchema: {
            from_date: z.string().describe('Start date (YYYY-MM-DD)'),
            to_date: z.string().describe('End date (YYYY-MM-DD)'),
          },
        }, async ({ from_date, to_date }) => {
          try {
            const entries = await redmineClient.getTimeLogsRange(from_date, to_date);

            if (entries.length === 0) {
              return { content: [{ type: 'text', text: `📭 No time logs from ${from_date} to ${to_date}` }] };
            }

            const total = entries.reduce((sum, e) => sum + e.hours, 0);
            let result = `📅 Time logs from ${from_date} to ${to_date}:\n\n`;

            // Group by date
            const byDate = {};
            for (const entry of entries) {
              const date = entry.spent_on;
              if (!byDate[date]) byDate[date] = [];
              byDate[date].push(entry);
            }

            for (const date of Object.keys(byDate).sort()) {
              const dayEntries = byDate[date];
              const dayTotal = dayEntries.reduce((sum, e) => sum + e.hours, 0);
              result += `\n[${date}] - ${dayTotal}h:\n`;
              for (const entry of dayEntries) {
                const issueId = entry.issue?.id || 'N/A';
                const comment = entry.comments || 'No comment';
                result += `  - #${issueId}: ${entry.hours}h (${comment})\n`;
              }
            }

            result += `\n⏱️  Total: ${total}h\n`;
            return { content: [{ type: 'text', text: result }] };
          } catch (error) {
            return { content: [{ type: 'text', text: `❌ Error: ${error.message}` }] };
          }
        });
      },
      {},
      { basePath: '/api' }
    );

    // Call the handler
    return handler(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
