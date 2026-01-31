/**
 * Redmine MCP Server Tools
 * Implements MCP tools for Redmine integration
 */

import { z } from 'zod';
import { RedmineClient } from './redmine-client.js';

export function createTools(redmineClient: RedmineClient) {
  return {
    list_my_tasks: {
      description: 'List tasks assigned to you with status filtering',
      parameters: z.object({
        status_filter: z
          .enum(['open', 'closed', 'all'])
          .default('open')
          .describe('Status filter: open, closed, or all'),
      }),
      execute: async ({ status_filter }: { status_filter: string }) => {
        try {
          const issues = await redmineClient.getMyIssues(status_filter);

          if (issues.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: '📭 No tasks found matching the filter.',
                },
              ],
            };
          }

          let result = `📋 Tasks (${issues.length}):\n\n`;

          for (const issue of issues) {
            const status = issue.status.name;
            const progress = issue.done_ratio || 0;
            const due = issue.due_date || 'N/A';
            const project = issue.project.name;

            result += `- #${issue.id} [${status}] ${progress}%: ${issue.subject}\n`;
            result += `  (Due: ${due} | Project: ${project})\n`;
          }

          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    get_issue_details: {
      description: 'Get detailed information about a specific issue',
      parameters: z.object({
        issue_id: z.number().int().positive().describe('Issue ID'),
      }),
      execute: async ({ issue_id }: { issue_id: number }) => {
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
            result += `\nDescription:\n${issue.description.substring(0, 500)}${issue.description.length > 500 ? '...' : ''}\n`;
          }

          if (issue.journals && issue.journals.length > 0) {
            const notes = issue.journals.filter((j) => j.notes);
            if (notes.length > 0) {
              result += `\nRecent notes:\n`;
              for (const note of notes.slice(-3)) {
                const author = note.user.name;
                const created = note.created_on.split('T')[0];
                result += `- [${created}] ${author}: ${note.notes?.substring(0, 100)}...\n`;
              }
            }
          }

          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    log_time: {
      description: 'Log time entry on a task',
      parameters: z.object({
        issue_id: z.number().int().positive().describe('Issue ID'),
        hours: z.number().positive().describe('Hours spent (e.g., 1.5)'),
        comment: z.string().describe('Work description'),
        activity_id: z
          .number()
          .int()
          .optional()
          .describe('Activity ID (optional, defaults to 9)'),
        spent_on: z
          .string()
          .optional()
          .describe('Date in YYYY-MM-DD format (optional, defaults to today)'),
      }),
      execute: async (params: {
        issue_id: number;
        hours: number;
        comment: string;
        activity_id?: number;
        spent_on?: string;
      }) => {
        try {
          await redmineClient.logTime({
            issue_id: params.issue_id,
            hours: params.hours,
            comment: params.comment,
            activity_id: params.activity_id,
            spent_on: params.spent_on,
          });

          let result = `✅ Logged ${params.hours}h on task #${params.issue_id}\n`;
          result += `   Comment: ${params.comment}`;

          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    update_issue_status: {
      description: 'Change issue status',
      parameters: z.object({
        issue_id: z.number().int().positive().describe('Issue ID'),
        status_id: z
          .number()
          .int()
          .positive()
          .describe('Status ID (e.g., 1=New, 2=In Progress, 3=Resolved)'),
      }),
      execute: async (params: { issue_id: number; status_id: number }) => {
        try {
          await redmineClient.updateIssueStatus(
            params.issue_id,
            params.status_id
          );

          return {
            content: [
              {
                type: 'text',
                text: `✅ Updated task #${params.issue_id} status to ${params.status_id}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    update_progress: {
      description: 'Update task completion percentage (0-100)',
      parameters: z.object({
        issue_id: z.number().int().positive().describe('Issue ID'),
        percent: z
          .number()
          .int()
          .min(0)
          .max(100)
          .describe('Completion percentage (0-100)'),
      }),
      execute: async (params: { issue_id: number; percent: number }) => {
        try {
          await redmineClient.updateProgress(params.issue_id, params.percent);

          return {
            content: [
              {
                type: 'text',
                text: `✅ Updated task #${params.issue_id} to ${params.percent}%`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    add_note: {
      description: 'Add a comment/note to an issue',
      parameters: z.object({
        issue_id: z.number().int().positive().describe('Issue ID'),
        note: z.string().describe('Comment text'),
      }),
      execute: async (params: { issue_id: number; note: string }) => {
        try {
          await redmineClient.addNote(params.issue_id, params.note);

          return {
            content: [
              {
                type: 'text',
                text: `✅ Added note to task #${params.issue_id}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    get_today_logs: {
      description: "View today's time entries and total hours",
      parameters: z.object({}),
      execute: async () => {
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

          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },

    get_time_logs_range: {
      description: 'View time logs within a date range',
      parameters: z.object({
        from_date: z.string().describe('Start date (YYYY-MM-DD)'),
        to_date: z.string().describe('End date (YYYY-MM-DD)'),
      }),
      execute: async (params: { from_date: string; to_date: string }) => {
        try {
          const entries = await redmineClient.getTimeLogsRange(
            params.from_date,
            params.to_date
          );

          if (entries.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `📭 No time logs from ${params.from_date} to ${params.to_date}`,
                },
              ],
            };
          }

          const total = entries.reduce((sum, e) => sum + e.hours, 0);

          let result = `📅 Time logs from ${params.from_date} to ${params.to_date}:\n\n`;

          // Group by date
          const byDate: Record<string, typeof entries> = {};
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

          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    },
  };
}
