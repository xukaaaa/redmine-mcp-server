/**
 * Redmine API Client
 * Handles all HTTP requests to Redmine REST API
 */

interface RedmineConfig {
  baseUrl: string;
  apiKey: string;
}

interface RedmineIssue {
  id: number;
  subject: string;
  status: { id: number; name: string };
  project: { id: number; name: string };
  done_ratio?: number;
  due_date?: string;
  assigned_to?: { id: number; name: string };
  start_date?: string;
  estimated_hours?: number;
  spent_hours?: number;
  description?: string;
  parent?: { id: number };
  children?: Array<{ id: number; subject: string }>;
  custom_fields?: Array<{ id: number; name: string; value: any }>;
  journals?: Array<{
    id: number;
    user: { id: number; name: string };
    notes?: string;
    created_on: string;
  }>;
}

interface RedmineTimeEntry {
  id: number;
  issue?: { id: number };
  hours: number;
  comments?: string;
  spent_on: string;
  activity: { id: number; name: string };
}

export class RedmineClient {
  private config: RedmineConfig;

  constructor(config: RedmineConfig) {
    this.config = config;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'X-Redmine-API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Redmine API Error ${response.status}: ${errorText}`
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async getMyIssues(statusFilter: string = 'open'): Promise<RedmineIssue[]> {
    let endpoint = '/issues.json?assigned_to_id=me&limit=25';

    if (statusFilter === 'open' || statusFilter === 'closed') {
      endpoint += `&status_id=${statusFilter}`;
    }

    const data = await this.request<{ issues: RedmineIssue[] }>(
      'GET',
      endpoint
    );
    return data.issues || [];
  }

  async getIssueDetails(issueId: number): Promise<RedmineIssue> {
    const data = await this.request<{ issue: RedmineIssue }>(
      'GET',
      `/issues/${issueId}.json?include=journals,children`
    );
    return data.issue;
  }

  async logTime(params: {
    issue_id: number;
    hours: number;
    comment: string;
    activity_id?: number;
    spent_on?: string;
  }): Promise<void> {
    const timeEntry = {
      issue_id: params.issue_id,
      hours: params.hours,
      comments: params.comment,
      activity_id: params.activity_id || 9, // Default activity
      spent_on: params.spent_on || new Date().toISOString().split('T')[0],
    };

    await this.request('POST', '/time_entries.json', {
      time_entry: timeEntry,
    });
  }

  async updateIssueStatus(
    issueId: number,
    statusId: number
  ): Promise<void> {
    await this.request('PUT', `/issues/${issueId}.json`, {
      issue: { status_id: statusId },
    });
  }

  async updateProgress(issueId: number, percent: number): Promise<void> {
    await this.request('PUT', `/issues/${issueId}.json`, {
      issue: { done_ratio: percent },
    });
  }

  async addNote(issueId: number, note: string): Promise<void> {
    await this.request('PUT', `/issues/${issueId}.json`, {
      issue: { notes: note },
    });
  }

  async getTodayLogs(): Promise<RedmineTimeEntry[]> {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.request<{ time_entries: RedmineTimeEntry[] }>(
      'GET',
      `/time_entries.json?user_id=me&from=${today}&to=${today}&limit=100`
    );
    return data.time_entries || [];
  }

  async getTimeLogsRange(
    fromDate: string,
    toDate: string
  ): Promise<RedmineTimeEntry[]> {
    const data = await this.request<{ time_entries: RedmineTimeEntry[] }>(
      'GET',
      `/time_entries.json?user_id=me&from=${fromDate}&to=${toDate}&limit=100`
    );
    return data.time_entries || [];
  }

  async getStatuses(): Promise<Array<{ id: number; name: string }>> {
    const data = await this.request<{
      issue_statuses: Array<{ id: number; name: string }>;
    }>('GET', '/issue_statuses.json');
    return data.issue_statuses || [];
  }
}
