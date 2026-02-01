# Redmine API - Complete Field Types Reference

## 1. CREATE ISSUE - POST /issues.json

### Required Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `project_id` | integer | `1` | Project ID (required) |
| `subject` | string | `"Fix login bug"` | Issue title (required) |

### Optional Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `description` | string | `"Users cannot login..."` | Issue description |
| `priority_id` | integer | `3` | 1=Low, 2=Normal, 3=High, 4=Urgent, 5=Immediate |
| `status_id` | integer | `2` | 1=New, 2=In Progress, 3=Resolved, 5=Closed, 6=Rejected |
| `assigned_to_id` | integer | `5` | User ID to assign |
| `parent_issue_id` | integer | `123` | Parent issue ID (for subtasks) |
| `estimated_hours` | float | `4.5` | Estimated hours (decimal) |
| `due_date` | string (date) | `"2025-02-15"` | Format: YYYY-MM-DD |
| `tracker_id` | integer | `1` | 1=Bug, 2=Feature, 3=Support, etc. |
| `category_id` | integer | `10` | Category ID |
| `fixed_version_id` | integer | `7` | Version/Release ID |
| `is_private` | boolean | `true` | Private issue flag |
| `custom_fields` | array | `[{"id": 1, "value": "val"}]` | Custom field values |
| `watcher_user_ids` | array | `[5, 6, 7]` | User IDs to watch |

---

## 2. UPDATE ISSUE - PUT /issues/{id}.json

### Updatable Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `subject` | string | `"Updated title"` | Issue title |
| `description` | string | `"New description"` | Issue description |
| `priority_id` | integer | `3` | Priority (1-5) |
| `status_id` | integer | `3` | Status ID |
| `assigned_to_id` | integer | `5` | User ID |
| `estimated_hours` | float | `5.0` | Estimated hours |
| `due_date` | string (date) | `"2025-02-20"` | Format: YYYY-MM-DD |
| `done_ratio` | integer | `50` | Completion percentage (0-100) |
| `notes` | string | `"Progress update"` | Comment to add |
| `custom_fields` | array | `[{"id": 1, "value": "val"}]` | Custom fields |
| `watcher_user_ids` | array | `[5, 6]` | User IDs to watch |

---

## 3. LIST ISSUES - GET /issues.json

### Query Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `project_id` | integer | `1` | Filter by project |
| `assigned_to_id` | integer or string | `5` or `"me"` | Filter by assignee |
| `status_id` | string | `"open"` or `"closed"` or `"all"` | Filter by status |
| `limit` | integer | `25` | Results per page (1-100, default 25) |
| `offset` | integer | `0` | Pagination offset |
| `sort` | string | `"id"` or `"subject"` | Sort field |
| `include` | string | `"journals,children"` | Include related data |

### Response Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `123` | Issue ID |
| `project` | object | `{"id": 1, "name": "..."}` | Project info |
| `subject` | string | `"Fix login bug"` | Issue title |
| `description` | string | `"Description..."` | Issue description |
| `status` | object | `{"id": 2, "name": "In Progress"}` | Status info |
| `priority` | object | `{"id": 3, "name": "High"}` | Priority info |
| `assigned_to` | object | `{"id": 5, "name": "John"}` | Assignee info |
| `done_ratio` | integer | `50` | Completion percentage (0-100) |
| `due_date` | string (date) | `"2025-02-15"` | Due date |
| `created_on` | string (datetime) | `"2025-01-15T10:30:00Z"` | Created timestamp |
| `updated_on` | string (datetime) | `"2025-02-01T14:20:00Z"` | Updated timestamp |
| `spent_hours` | float | `8.5` | Total hours logged |
| `estimated_hours` | float | `10.0` | Estimated hours |

---

## 4. GET ISSUE - GET /issues/{id}.json

### Path Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `id` | integer | `123` | Issue ID |

### Query Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `include` | string | `"journals,children"` | Include related data |

### Response Fields (same as LIST ISSUES + additional)
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `journals` | array | `[{...}]` | Comments/history (if include=journals) |
| `children` | array | `[{...}]` | Subtasks (if include=children) |
| `parent` | object | `{"id": 100}` | Parent issue (if subtask) |
| `custom_fields` | array | `[{"id": 1, "value": "val"}]` | Custom field values |

---

## 5. LIST PROJECTS - GET /projects.json

### Query Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `limit` | integer | `25` | Results per page |
| `offset` | integer | `0` | Pagination offset |

### Response Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `1` | Project ID |
| `name` | string | `"Project A"` | Project name |
| `identifier` | string | `"proj-a"` | Project identifier |
| `description` | string | `"Description..."` | Project description |
| `created_on` | string (datetime) | `"2025-01-01T00:00:00Z"` | Created timestamp |

---

## 6. LIST STATUSES - GET /issue_statuses.json

### Response Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `1` | Status ID |
| `name` | string | `"New"` | Status name |
| `is_closed` | boolean | `false` | Whether status is closed |

---

## 7. GET CURRENT USER - GET /users/current.json

### Response Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `5` | User ID |
| `login` | string | `"john"` | Username |
| `firstname` | string | `"John"` | First name |
| `lastname` | string | `"Doe"` | Last name |
| `mail` | string | `"john@example.com"` | Email |
| `created_on` | string (datetime) | `"2025-01-01T00:00:00Z"` | Created timestamp |
| `last_login_on` | string (datetime) | `"2025-02-01T14:20:00Z"` | Last login |

---

## 8. LIST USERS - GET /users.json

### Query Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `limit` | integer | `25` | Results per page |
| `offset` | integer | `0` | Pagination offset |

### Response Fields (same as GET CURRENT USER)
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `5` | User ID |
| `login` | string | `"john"` | Username |
| `firstname` | string | `"John"` | First name |
| `lastname` | string | `"Doe"` | Last name |
| `mail` | string | `"john@example.com"` | Email |

---

## 9. LOG TIME - POST /time_entries.json

### Required Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `issue_id` | integer | `123` | Issue ID (required) |
| `hours` | float | `2.5` | Hours spent (required, decimal) |
| `activity_id` | integer | `9` | Activity ID (required) |

### Optional Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `spent_on` | string (date) | `"2025-02-01"` | Date (YYYY-MM-DD, default today) |
| `comments` | string | `"Code review"` | Comment |

### Response Fields
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | integer | `456` | Time entry ID |
| `issue` | object | `{"id": 123}` | Issue info |
| `user` | object | `{"id": 5}` | User info |
| `hours` | float | `2.5` | Hours logged |
| `activity` | object | `{"id": 9, "name": "Development"}` | Activity info |
| `spent_on` | string (date) | `"2025-02-01"` | Date logged |
| `comments` | string | `"Code review"` | Comment |
| `created_on` | string (datetime) | `"2025-02-01T10:30:00Z"` | Created timestamp |
| `updated_on` | string (datetime) | `"2025-02-01T10:30:00Z"` | Updated timestamp |

---

## 10. LIST TIME ENTRIES - GET /time_entries.json

### Query Parameters
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `user_id` | integer or string | `5` or `"me"` | Filter by user |
| `issue_id` | integer | `123` | Filter by issue |
| `from` | string (date) | `"2025-01-01"` | Start date (YYYY-MM-DD) |
| `to` | string (date) | `"2025-01-31"` | End date (YYYY-MM-DD) |
| `limit` | integer | `25` | Results per page |
| `offset` | integer | `0` | Pagination offset |

### Response Fields (same as LOG TIME response)

---

## Type Summary

### Primitive Types
| Type | Description | Example |
|------|-------------|---------|
| `integer` | Whole number | `123`, `5`, `0` |
| `float` | Decimal number | `2.5`, `10.0`, `0.5` |
| `string` | Text | `"John"`, `"Fix bug"` |
| `boolean` | True/False | `true`, `false` |
| `date` | Date (YYYY-MM-DD) | `"2025-02-15"` |
| `datetime` | Timestamp (ISO 8601) | `"2025-02-01T10:30:00Z"` |

### Complex Types
| Type | Description | Example |
|------|-------------|---------|
| `object` | JSON object | `{"id": 1, "name": "..."}` |
| `array` | JSON array | `[1, 2, 3]` or `[{...}, {...}]` |

---

## Common ID Reference

### Status IDs
| ID | Name | Closed |
|----|------|--------|
| 1 | New | No |
| 2 | In Progress | No |
| 3 | Resolved | No |
| 4 | Feedback | No |
| 5 | Closed | Yes |
| 6 | Rejected | Yes |

### Priority IDs
| ID | Name |
|----|------|
| 1 | Low |
| 2 | Normal |
| 3 | High |
| 4 | Urgent |
| 5 | Immediate |

### Activity IDs (for time entries)
| ID | Name |
|----|------|
| 9 | Development |
| 10 | Design |
| 11 | Testing |
| 12 | Documentation |
| 13 | Support |
| 14 | Management |

### Tracker IDs
| ID | Name |
|----|------|
| 1 | Bug |
| 2 | Feature |
| 3 | Support |
| 4 | Patch |

---

## Zod Schema Examples (for TypeScript/JavaScript)

```typescript
import { z } from 'zod';

// Create Issue Schema
const CreateIssueSchema = z.object({
  project_id: z.number().int().positive(),
  subject: z.string().min(1),
  description: z.string().optional(),
  priority_id: z.number().int().min(1).max(5).optional(),
  status_id: z.number().int().positive().optional(),
  assigned_to_id: z.number().int().positive().optional(),
  estimated_hours: z.number().positive().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  custom_fields: z.array(z.object({
    id: z.number().int(),
    value: z.string()
  })).optional()
});

// Log Time Schema
const LogTimeSchema = z.object({
  issue_id: z.number().int().positive(),
  hours: z.number().positive(),
  activity_id: z.number().int().positive(),
  spent_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  comments: z.string().optional()
});

// Update Issue Schema
const UpdateIssueSchema = z.object({
  subject: z.string().optional(),
  description: z.string().optional(),
  priority_id: z.number().int().min(1).max(5).optional(),
  status_id: z.number().int().positive().optional(),
  assigned_to_id: z.number().int().positive().optional(),
  done_ratio: z.number().int().min(0).max(100).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional()
});
```

---

## Notes
- **Dates**: Always use `YYYY-MM-DD` format
- **Datetimes**: ISO 8601 format with timezone (e.g., `2025-02-01T10:30:00Z`)
- **Floats**: Use decimal notation (e.g., `2.5`, not `2,5`)
- **Booleans**: Use `true`/`false` (lowercase in JSON)
- **Arrays**: Can contain primitives or objects
- **Objects**: Nested JSON structures
- **Null values**: Omit optional fields instead of sending `null`
