# Recommended New Tools for Redmine MCP Server

Based on Redmine REST API documentation, here are the recommended tools to add:

---

## 🎯 TOP 3 PRIORITY (Implement First)

### 1. **`list_statuses`** ⭐⭐⭐ MUST-HAVE
**Why**: Users currently need to remember status IDs (1=New, 2=In Progress, etc.)

**Endpoint**: `GET /issue_statuses.json`

**Parameters**: None

**Response**:
```json
{
  "issue_statuses": [
    {"id": 1, "name": "New", "is_closed": false},
    {"id": 2, "name": "In Progress", "is_closed": false},
    {"id": 3, "name": "Resolved", "is_closed": false},
    {"id": 5, "name": "Closed", "is_closed": true}
  ]
}
```

**Use Case**: "What statuses are available?" → Returns all status IDs and names

---

### 2. **`create_issue`** ⭐⭐⭐ HIGH VALUE
**Why**: Create tasks directly from Claude without UI

**Endpoint**: `POST /issues.json`

**Required Parameters**:
- `project_id` (integer) - Project ID
- `subject` (string) - Issue title

**Optional Parameters**:
- `description` (string) - Issue description
- `priority_id` (integer) - 1=Low, 2=Normal, 3=High, 4=Urgent, 5=Immediate
- `status_id` (integer) - Status ID
- `assigned_to_id` (integer) - User ID to assign
- `estimated_hours` (float) - Estimated hours
- `due_date` (string) - YYYY-MM-DD format
- `tracker_id` (integer) - Tracker type
- `category_id` (integer) - Category
- `custom_fields` (array) - Custom field values

**Example Request**:
```json
{
  "issue": {
    "project_id": 1,
    "subject": "Fix login bug",
    "description": "Users cannot login with SSO",
    "priority_id": 3,
    "assigned_to_id": 5,
    "due_date": "2025-02-15"
  }
}
```

**Use Case**: "Create a bug for login page with high priority, assign to John, due Feb 15"

---

### 3. **`get_user_info`** ⭐⭐⭐ SUPPORT TOOL
**Why**: Map username → user_id (needed for `assign_issue`, `add_watcher`)

**Endpoint**: `GET /users.json` (search) or `GET /users/current.json` (current user)

**Parameters**:
- `username` (string, optional) - Username to search for
- If not provided, returns current user

**Response**:
```json
{
  "user": {
    "id": 5,
    "login": "john",
    "firstname": "John",
    "lastname": "Doe",
    "mail": "john@example.com"
  }
}
```

**Use Case**: "Who is john?" → Returns user_id=5, then can use in assign_issue

---

## 📊 SECONDARY TOOLS (Nice-to-have)

### 4. **`list_projects`** ⭐⭐
**Why**: Get project_id for create_issue

**Endpoint**: `GET /projects.json`

**Parameters**:
- `limit` (integer, optional) - Default 25
- `offset` (integer, optional) - Pagination

**Response**:
```json
{
  "projects": [
    {"id": 1, "name": "Project A", "identifier": "proj-a"},
    {"id": 2, "name": "Project B", "identifier": "proj-b"}
  ]
}
```

---

### 5. **`assign_issue`** ⭐⭐
**Why**: Assign task to someone (cleaner than generic update)

**Endpoint**: `PUT /issues/{id}.json`

**Parameters**:
- `issue_id` (integer, required) - Issue ID
- `assigned_to_id` (integer, required) - User ID to assign

**Request Body**:
```json
{
  "issue": {
    "assigned_to_id": 5
  }
}
```

**Use Case**: "Assign issue #123 to john"

---

### 6. **`get_issue_comments`** ⭐⭐
**Why**: View full comment history (better than get_issue_details which truncates)

**Endpoint**: `GET /issues/{id}.json?include=journals`

**Parameters**:
- `issue_id` (integer, required) - Issue ID

**Response**: Returns issue with `journals` array containing all comments

---

### 7. **`set_due_date`** ⭐
**Why**: Update deadline (cleaner than generic update)

**Endpoint**: `PUT /issues/{id}.json`

**Parameters**:
- `issue_id` (integer, required) - Issue ID
- `due_date` (string, required) - YYYY-MM-DD format

**Request Body**:
```json
{
  "issue": {
    "due_date": "2025-02-15"
  }
}
```

---

### 8. **`add_watcher`** ⭐
**Why**: Follow issue for notifications

**Endpoint**: `POST /issues/{id}/watchers.json`

**Parameters**:
- `issue_id` (integer, required) - Issue ID
- `user_id` (integer, optional) - User to add (default = current user)

**Request Body**:
```json
{
  "user_id": 5
}
```

---

## 📋 IMPLEMENTATION PRIORITY

**Phase 1 (Week 1)** - Must-have:
1. `list_statuses` - Solves immediate pain point
2. `create_issue` - High productivity gain
3. `get_user_info` - Support for other tools

**Phase 2 (Week 2)** - Nice-to-have:
4. `list_projects` - Support for create_issue
5. `assign_issue` - Cleaner than generic update
6. `get_issue_comments` - Better issue viewing

**Phase 3 (Optional)**:
7. `set_due_date` - Convenience tool
8. `add_watcher` - Notification management

---

## 🔧 Implementation Notes

### Common Patterns
- All endpoints use `X-Redmine-API-Key` header
- Dates: YYYY-MM-DD format
- IDs: Use integers, not strings
- Custom fields: Pass as array with `id` and `value`

### Error Handling
- 401: Invalid API key
- 403: Permission denied
- 404: Resource not found
- 422: Validation error (missing required fields)

### Testing
Use your Redmine instance:
```bash
# Get current user
curl -H "X-Redmine-API-Key: YOUR_KEY" \
  https://redmine.vietis.com.vn:93/users/current.json

# List statuses
curl -H "X-Redmine-API-Key: YOUR_KEY" \
  https://redmine.vietis.com.vn:93/issue_statuses.json

# Create issue
curl -X POST -H "X-Redmine-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"issue":{"project_id":1,"subject":"Test"}}' \
  https://redmine.vietis.com.vn:93/issues.json
```

---

## ✅ Recommendation

**Start with Phase 1** (3 tools):
1. `list_statuses` - 30 min
2. `create_issue` - 1 hour
3. `get_user_info` - 30 min

**Total**: ~2 hours for massive productivity boost!

Bạn muốn implement cái nào trước?
