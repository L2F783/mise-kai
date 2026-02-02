# Product Requirements Document: MiseKai Phase 1 - Actions Register

**Version**: 1.2
**Status**: Draft
**Last Updated**: February 1, 2026
**Author**: Patrick Salazar
**Phase**: 1 of 7

---

## 1. Executive Summary

MiseKai Phase 1 delivers a web-based Action Register that replaces scattered spreadsheets with a single source of truth for team tasks. It enables 6-10 team members to manage their own actions, automatically flags delayed items, and provides Patrick (PM) with coaching insights through 5 Whys analysis and AI-powered pattern detection on delay reasons.

---

## 2. User Stories

### US-001: Team Member Views Personal Actions
**As a** team member
**I want** to see only my assigned actions in a table view
**So that** I can focus on my work without distraction from others' tasks

**Acceptance Criteria**:
- [ ] User sees table with columns: Date, Description, Due Date, Status, Notes
- [ ] Only actions where `owner_id = current_user.id` are displayed
- [ ] Table is sortable by any column
- [ ] Default sort: Due Date ascending (nearest first)

**Priority**: P1
**Estimated Effort**: M

---

### US-002: Team Member Creates Action
**As a** team member
**I want** to create a new action item
**So that** I can track work I've committed to

**Acceptance Criteria**:
- [ ] Form fields: Description (required), Due Date (required), Notes (optional)
- [ ] Owner auto-set to current user
- [ ] Status defaults to "On Target"
- [ ] Date auto-set to creation timestamp
- [ ] Action appears in list immediately after save
- [ ] Validation error shown if required fields missing

**Priority**: P1
**Estimated Effort**: S

---

### US-003: Team Member Updates Action Status
**As a** team member
**I want** to update the status of my actions
**So that** progress is accurately reflected

**Acceptance Criteria**:
- [ ] Status dropdown: On Target, Delayed, Complete
- [ ] When "Delayed" selected, delay reason modal appears
- [ ] Delay reason is freeform text (required, min 10 chars)
- [ ] Status change updates `updated_at` timestamp
- [ ] Complete status sets `completed_at` timestamp

**Priority**: P1
**Estimated Effort**: M

---

### US-004: System Auto-Flags Delayed Items
**As a** user
**I want** items past their due date to be automatically flagged
**So that** delays are visible without manual status updates

**Acceptance Criteria**:
- [ ] Cron/scheduled job runs daily at midnight
- [ ] Actions where `due_date < today` AND `status = 'on_target'` are flagged
- [ ] Status changed to "Delayed" with system-generated reason: "Auto-flagged: past due date"
- [ ] User can update the delay reason afterward
- [ ] `auto_flagged` boolean set to true for tracking

**Priority**: P1
**Estimated Effort**: M

---

### US-005: PM Views All Actions
**As a** PM (Patrick)
**I want** to see all team members' actions
**So that** I have complete visibility across the team

**Acceptance Criteria**:
- [ ] PM role sees all actions regardless of owner
- [ ] Additional "Owner" column visible in table
- [ ] Filter by owner (dropdown of team members)
- [ ] Filter by status (On Target, Delayed, Complete, All)
- [ ] Filter by due date range (This Week, Next Week, Overdue, Custom)
- [ ] Filters are combinable (AND logic)
- [ ] Filter state persists in URL for bookmarking

**Priority**: P1
**Estimated Effort**: M

---

### US-006: PM Assigns Action to Team Member
**As a** PM
**I want** to create actions and assign them to specific team members
**So that** I can delegate work effectively

**Acceptance Criteria**:
- [ ] PM sees "Owner" dropdown when creating action
- [ ] Dropdown lists all active team members
- [ ] PM can reassign existing actions to different owners
- [ ] Reassignment logged in action history

**Priority**: P1
**Estimated Effort**: S

---

### US-007: PM Invites Team Members
**As a** PM
**I want** to invite team members via email
**So that** only authorized people can access the system

**Acceptance Criteria**:
- [ ] Invite form: email address (required)
- [ ] System sends invite email with magic link
- [ ] Recipient clicks link, sets password, account activated
- [ ] Invite expires after 7 days
- [ ] PM can resend or revoke pending invites
- [ ] PM sees list of all users and their status (active, pending, deactivated)

**Priority**: P1
**Estimated Effort**: M

---

### US-008: PM Runs Weekly Review
**As a** PM
**I want** to run a structured weekly review of delayed items
**So that** I can coach the team and identify systemic blockers

**Acceptance Criteria**:
- [ ] "Weekly Review" button enters review mode
- [ ] Shows only items with status = "Delayed"
- [ ] Items sorted by delay duration (longest first)
- [ ] Each item shows delay reason and any previous 5 Whys analysis
- [ ] PM can trigger 5 Whys flow for any delayed item

**Priority**: P1
**Estimated Effort**: L

---

### US-009: PM Conducts 5 Whys Analysis
**As a** PM
**I want** to walk through 5 Whys for a delayed item
**So that** I can identify root causes

**Acceptance Criteria**:
- [ ] 5 Whys modal shows action description and current delay reason
- [ ] System prompts "Why did this happen?" (Why #1)
- [ ] User types response (min 20 chars), clicks Continue
- [ ] System prompts "Why?" for each subsequent level (up to 5)
- [ ] User can stop at any level (root cause reached)
- [ ] All responses saved to `five_whys_analysis` table
- [ ] Analysis linked to action via `action_id`
- [ ] Previous analyses viewable for reference

**Priority**: P1
**Estimated Effort**: L

---

### US-010: System Categorizes Delay Reasons
**As a** user
**I want** delay reasons to be auto-categorized
**So that** patterns can be detected across the team

**Acceptance Criteria**:
- [ ] When delay reason saved, AI categorizes into predefined buckets
- [ ] Categories: People (waiting, handoff), Process (unclear, blocked), Technical (bug, complexity), Capacity (time, priorities), External (vendor, customer), Other
- [ ] Confidence score stored (0-1)
- [ ] Low confidence (<0.7) flagged for PM review
- [ ] Category can be manually overridden by PM
- [ ] Categorization happens asynchronously (not blocking)

**Priority**: P2
**Estimated Effort**: L

---

### US-011: PM Views Coaching Insights
**As a** PM
**I want** to see patterns in delay reasons
**So that** I can address systemic issues

**Acceptance Criteria**:
- [ ] Insights panel shows top 3 delay categories (last 30 days)
- [ ] Each category shows count and percentage
- [ ] Drill-down shows specific items in that category
- [ ] Trend indicator: up/down vs previous 30 days
- [ ] Recurring root causes highlighted (same 5 Whys pattern >2 times)

**Priority**: P2
**Estimated Effort**: L

---

### US-012: User Exports Actions to CSV
**As a** user
**I want** to export my actions to CSV
**So that** I can share or analyze data externally

**Acceptance Criteria**:
- [ ] "Export CSV" button visible on actions list
- [ ] Team member export: their actions only
- [ ] PM export: all actions or filtered set
- [ ] CSV includes: ID, Date, Description, Owner, Due Date, Status, Delay Reason, Completed At, Notes
- [ ] Filename: `misekai-actions-YYYY-MM-DD.csv`
- [ ] Export respects current filters

**Priority**: P2
**Estimated Effort**: S

---

### US-013: User Authenticates via Email/Password
**As a** user
**I want** to log in with email and password
**So that** I can access my actions securely

**Acceptance Criteria**:
- [ ] Login page with email and password fields
- [ ] "Forgot password" flow sends reset link
- [ ] Session persists for 7 days (remember me)
- [ ] Logout clears session
- [ ] Rate limiting: 5 failed attempts triggers 15-min lockout
- [ ] Password requirements: 8+ chars, 1 number, 1 special char

**Priority**: P1
**Estimated Effort**: M (Supabase handles most)

---

### US-014: Action Marked Customer-Relevant
**As a** PM
**I want** to tag actions as customer-relevant
**So that** they can be included in Client View (Phase 3)

**Acceptance Criteria**:
- [ ] Checkbox "Show in Client View" on action form
- [ ] Only PM can toggle this checkbox
- [ ] Default: unchecked
- [ ] Field stored as `client_visible` boolean
- [ ] Filter available: "Client-relevant only"

**Priority**: P3
**Estimated Effort**: S

---

### US-015: Enhanced Action Register Table
**As a** team member or PM
**I want** a feature-rich, Excel-like table interface for the action register
**So that** I can efficiently view, filter, sort, and edit actions without leaving the list view

**Acceptance Criteria**:
- [ ] Clickable column headers sort the table (ascending/descending toggle)
- [ ] Search bar filters actions by description text
- [ ] Status autocomplete filter shows dropdown with On Target, Delayed, Complete options
- [ ] Completed items older than 7 days are hidden by default
- [ ] "Show completed" toggle reveals all completed items regardless of age
- [ ] Footer row provides quick-add form (Description, Due Date, Assignee)
- [ ] Assignee column displays owner name with avatar (PM sees all, team member sees own)
- [ ] Status cell is inline-editable via dropdown
- [ ] Notes cell is inline-editable via text input (click to edit)
- [ ] Due Date cell is inline-editable via date picker popover
- [ ] Edit icon/link on each row opens full edit modal
- [ ] Trash icon on each row triggers delete confirmation
- [ ] Changes save automatically on blur/selection with optimistic updates
- [ ] DataTable component is reusable for other data types (generic implementation)

**Priority**: P1
**Estimated Effort**: L

---

### US-016: PM Reorders Actions via Drag-and-Drop
**As a** PM
**I want** to drag-and-drop actions to set their priority order
**So that** I can communicate work priority to the team visually

**Acceptance Criteria**:
- [ ] Drag handle (grip icon) appears on each row for PM only
- [ ] PM can drag any action row to reorder within the list
- [ ] New order persists immediately (optimistic update)
- [ ] Team members see the priority order but cannot drag
- [ ] Order is global across all assignees (not per-person)
- [ ] Keyboard accessible: Enter to pick up, arrows to move, Enter to drop
- [ ] Visual feedback during drag (row lifts, drop indicator shows)
- [ ] Undo available via Ctrl+Z within 5 seconds of reorder

**Priority**: P1
**Estimated Effort**: M

---

### US-017: Backlog Management
**As a** PM or team member
**I want** to separate active work from backlog items
**So that** the team can focus on immediate priorities without distraction

**Acceptance Criteria**:
- [ ] Actions page has Active/Backlog tab toggle
- [ ] Active tab shows items where is_backlog = false
- [ ] Backlog tab shows items where is_backlog = true
- [ ] WIP limit: max 3 active items per assignee enforced
- [ ] PM can move any item between active/backlog
- [ ] Team member cannot move items (view only for backlog status)
- [ ] Moving to active when at WIP limit shows error message
- [ ] Tab counts shown: "Active (12)" / "Backlog (8)"
- [ ] Default view is Active tab
- [ ] Backlog items are not shown in Weekly Review

**Priority**: P1
**Estimated Effort**: L

---

### US-018: Capacity Notification for PM
**As a** PM
**I want** to be notified when team members have capacity for more work
**So that** I can promote backlog items to keep the team productive

**Acceptance Criteria**:
- [ ] Badge in header shows count of team members with <3 active items
- [ ] Badge only visible to PM role
- [ ] Clicking badge opens Capacity Panel
- [ ] Panel shows list: Avatar, Name, Active count (e.g., "2/3"), Top backlog item
- [ ] "Promote" button next to each team member with backlog items
- [ ] Clicking Promote moves their top backlog item to active
- [ ] Badge updates in real-time as capacity changes
- [ ] Badge hidden when all team members are at capacity (3 items each)

**Priority**: P2
**Estimated Effort**: M

---

## 3. Functional Requirements

### FR-001: Action CRUD Operations

**Description**:
Full create, read, update, delete operations for action items.

**Inputs**:
- `description`: string (required, 5-500 chars)
- `due_date`: date (required, must be today or future on create)
- `notes`: string (optional, max 2000 chars)
- `owner_id`: UUID (required, valid user ID)
- `status`: enum (default: 'on_target')
- `client_visible`: boolean (default: false)

**Outputs**:
- Action object with all fields plus `id`, `created_at`, `updated_at`

**Business Rules**:
- Users can only edit/delete their own actions (unless PM)
- PM can edit any action
- Completed actions cannot be deleted (soft delete only)
- Due date can be changed on active actions (creates `due_date_history` entry)

**Acceptance Criteria**:
- [ ] Create action with required fields succeeds
- [ ] Create action missing required fields returns 400
- [ ] Update action by non-owner returns 403
- [ ] Delete completed action returns 400

**Error Handling**:
- Missing required field → 400 with field-specific message
- Invalid owner_id → 400 "Invalid owner"
- Unauthorized edit → 403 "Not authorized"
- Action not found → 404 "Action not found"

---

### FR-002: Status Transition with Delay Reason

**Description**:
Status changes follow rules, and Delayed status requires a reason.

**Inputs**:
- `action_id`: UUID
- `new_status`: enum ('on_target', 'delayed', 'complete')
- `delay_reason`: string (required if new_status = 'delayed', min 10 chars)

**Outputs**:
- Updated action object
- Delay reason record (if applicable)

**Business Rules**:
- Any status can transition to any other status
- Delayed → On Target clears active delay but preserves history
- Complete sets `completed_at` timestamp
- Re-opening Complete action clears `completed_at`
- System auto-flag sets `auto_flagged = true`

**Acceptance Criteria**:
- [ ] On Target → Delayed requires delay reason
- [ ] Delayed → Complete succeeds without additional input
- [ ] Status history is preserved for audit

**Error Handling**:
- Missing delay reason → 400 "Delay reason required (min 10 characters)"
- Delay reason too short → 400 "Delay reason must be at least 10 characters"

---

### FR-003: Row Level Security

**Description**:
Users see only their own data; PM sees all.

**Inputs**:
- `user_id`: UUID (from auth session)
- `user_role`: enum ('team_member', 'pm')

**Outputs**:
- Filtered query results based on role

**Business Rules**:
- Role 'team_member': SELECT/UPDATE/DELETE WHERE owner_id = user_id
- Role 'pm': SELECT/UPDATE/DELETE all records
- INSERT: any authenticated user
- User role stored in `profiles.role` column

**Acceptance Criteria**:
- [ ] Team member query returns only own actions
- [ ] PM query returns all actions
- [ ] Team member cannot read others' actions via direct ID
- [ ] RLS policies enforce at database level

**Error Handling**:
- Unauthenticated request → 401 "Authentication required"
- RLS violation → empty result (not error, by design)

---

### FR-004: Filtering and Sorting

**Description**:
Actions list supports multiple filters and sort options.

**Inputs**:
- `owner_id`: UUID (optional, PM only)
- `status`: enum or 'all'
- `due_date_range`: 'this_week' | 'next_week' | 'overdue' | {start, end}
- `sort_by`: 'due_date' | 'created_at' | 'status' | 'owner'
- `sort_order`: 'asc' | 'desc'

**Outputs**:
- Filtered, sorted list of actions

**Business Rules**:
- Filters combine with AND logic
- Default: status = 'all', sort = due_date asc
- 'Overdue' = due_date < today AND status != 'complete'
- 'This week' = due_date between Monday and Sunday of current week

**Acceptance Criteria**:
- [ ] Single filter returns correct subset
- [ ] Multiple filters return intersection
- [ ] Sort applies after filtering
- [ ] Pagination works with filters (20 items per page)

---

### FR-005: 5 Whys Analysis Storage

**Description**:
Store and retrieve 5 Whys analyses for delayed actions.

**Inputs**:
- `action_id`: UUID
- `whys`: array of {level: 1-5, response: string, created_at: timestamp}
- `root_cause_identified`: boolean
- `conducted_by`: UUID (PM user ID)

**Outputs**:
- Five Whys analysis record

**Business Rules**:
- Only PM can create 5 Whys analysis
- Minimum 1 why, maximum 5
- Each response: 20-500 chars
- Multiple analyses allowed per action (tracks history)
- Most recent analysis shown by default

**Acceptance Criteria**:
- [ ] PM can create analysis with 1-5 levels
- [ ] Team member cannot create analysis (403)
- [ ] Previous analyses preserved and viewable
- [ ] Incomplete analysis (exited early) still saved

---

### FR-006: AI Delay Categorization

**Description**:
Automatically categorize freeform delay reasons into buckets.

**Inputs**:
- `delay_reason`: string
- `action_context`: {description, owner, due_date}

**Outputs**:
- `category`: enum
- `confidence`: float (0-1)
- `suggested_subcategory`: string

**Categories**:
```
people: waiting_on_others, handoff_delay, availability
process: unclear_requirements, approval_blocked, dependencies
technical: bug_found, complexity_underestimated, technical_debt
capacity: competing_priorities, time_constraint, resource_shortage
external: vendor_delay, customer_dependency, third_party
other: uncategorized
```

**Business Rules**:
- Categorization is async (non-blocking to UI)
- Runs on delay reason create/update
- Confidence < 0.7 flags for PM review
- PM override stores `manual_category` and marks `ai_overridden = true`

**Acceptance Criteria**:
- [ ] Delay reason saved triggers categorization job
- [ ] Category appears on action within 5 seconds
- [ ] Low confidence items appear in PM review queue
- [ ] PM can override category

---

### FR-007: Coaching Insights Aggregation

**Description**:
Aggregate delay patterns for PM coaching view.

**Inputs**:
- `date_range`: {start, end} (default: last 30 days)
- `owner_filter`: UUID (optional, for per-person insights)

**Outputs**:
- `top_categories`: [{category, count, percentage, trend}]
- `recurring_root_causes`: [{pattern, count, action_ids}]
- `team_health_score`: float (0-100)

**Business Rules**:
- Top categories limited to 5
- Trend: compare to previous period of same length
- Recurring = same category + similar 5 Whys pattern (>2 occurrences)
- Health score: 100 - (delayed_percentage * 0.5) - (recurring_issues * 10)

**Acceptance Criteria**:
- [ ] Insights panel loads within 2 seconds
- [ ] Drill-down shows specific actions
- [ ] Trends accurately reflect period comparison
- [ ] Empty state shown if no delays in period

---

### FR-008: CSV Export

**Description**:
Export actions to CSV file.

**Inputs**:
- `filters`: current filter state (optional)
- `user_id`: UUID (for permission check)

**Outputs**:
- CSV file download

**CSV Columns**:
```
ID, Created Date, Description, Owner, Due Date, Status, Delay Reason, Delay Category, Completed Date, Client Visible, Notes
```

**Business Rules**:
- Team member: exports own actions only
- PM: exports all (or filtered subset)
- Dates formatted: YYYY-MM-DD
- Empty fields: empty string (not "null")
- UTF-8 encoding with BOM for Excel compatibility

**Acceptance Criteria**:
- [ ] Export button triggers download
- [ ] Filename includes current date
- [ ] Filters respected in export
- [ ] File opens correctly in Excel

---

### FR-009: Reusable DataTable Component

**Description**:
Generic, headless DataTable component built on TanStack Table v8 that provides sorting, filtering, inline editing, and CRUD operations. Designed for reuse across actions, users, and future data types.

**Inputs**:
- `columns`: ColumnDef[] (TanStack Table column definitions)
- `data`: T[] (generic data array)
- `onRowUpdate`: (id, updates) => Promise<void> (inline edit callback)
- `onRowDelete`: (id) => Promise<void> (delete callback)
- `onRowCreate`: (data) => Promise<void> (quick-add callback)
- `filterConfig`: { searchField, filterFields } (filter configuration)
- `defaultFilters`: FilterState (e.g., hide old completed)
- `enableInlineEdit`: boolean (default: true)
- `enableQuickAdd`: boolean (default: true)

**Outputs**:
- Rendered table with all interactive features
- Callbacks invoked on user actions

**Business Rules**:
- Inline edits trigger validation before save
- Optimistic updates with rollback on error
- Sort state persists in URL query params
- Filter state persists in URL query params
- Completed items >7 days hidden by default (configurable)

**Acceptance Criteria**:
- [ ] Component renders with any data type (generic TypeScript)
- [ ] Sorting works on any sortable column
- [ ] Filtering works with search + column-specific filters
- [ ] Inline editing validates and saves on blur
- [ ] Quick-add validates and creates on submit
- [ ] All operations show loading/success/error states
- [ ] Component is accessible (keyboard navigation, ARIA labels)

**Error Handling**:
- Validation error → inline error message, revert cell
- Save error → toast notification, revert to previous value
- Network error → retry prompt with exponential backoff

---

### FR-010: Drag-and-Drop Priority Ordering

**Description**:
Enable PM to reorder action items via drag-and-drop to set global priority. Order is persisted and visible to all users.

**Inputs**:
- Drag start: `action_id` being dragged
- Drop position: `target_index` in list
- User role: must be 'pm'

**Outputs**:
- Updated `sort_order` values for affected rows
- Reordered UI reflecting new positions

**Business Rules**:
- Only PM role can initiate drag operations
- Sort order is global (not per-assignee)
- Lower sort_order = higher priority (1 is top)
- Reorder updates all affected items in single transaction
- Completed items maintain their relative order but sort below active
- Backlog items have separate sort_order sequence

**Acceptance Criteria**:
- [ ] PM can drag any row to new position
- [ ] Non-PM users see drag handles disabled/hidden
- [ ] Batch update API handles reorder efficiently
- [ ] Optimistic update with rollback on error
- [ ] Maximum 100 items can be reordered in single operation

**Error Handling**:
- Non-PM attempts drag → operation ignored, no error shown
- Network failure → toast "Failed to save order", revert to previous
- Concurrent edit conflict → refetch and reapply if possible

---

### FR-011: Active/Backlog Status Management

**Description**:
Manage actions as either "active" (in focus) or "backlog" (future work) with WIP limits.

**Inputs**:
- `action_id`: UUID
- `is_backlog`: boolean (true = backlog, false = active)
- `owner_id`: UUID (for WIP limit check)

**Outputs**:
- Updated action with new backlog status
- Error if WIP limit exceeded

**Business Rules**:
- WIP limit: 3 active items maximum per assignee
- PM can move any item regardless of owner
- Team members cannot change backlog status (read-only)
- Moving to active checks: count WHERE owner_id = X AND is_backlog = false < 3
- Moving to backlog always allowed (no limit)
- New actions default to backlog = false (active)
- If new action would exceed WIP, prompt to add to backlog instead

**Acceptance Criteria**:
- [ ] PM can toggle any action's backlog status
- [ ] WIP limit enforced on move to active
- [ ] Clear error message when limit exceeded
- [ ] Tab counts update immediately after move
- [ ] RLS policies enforce edit restrictions

**Error Handling**:
- WIP limit exceeded → 400 "Cannot add to active: [Name] has 3 active items. Move to backlog or complete an existing item."
- Non-PM attempts move → 403 "Only PM can change backlog status"

---

### FR-012: Capacity Alert System

**Description**:
Alert PM when team members have capacity (fewer than 3 active items) to receive more work.

**Inputs**:
- Current user role (PM only sees alerts)
- Team member active item counts

**Outputs**:
- Badge count of team members with capacity
- Capacity panel with details and promote actions

**Business Rules**:
- Capacity = active_count < 3
- Only count active team members (not deactivated)
- Update in real-time (via query refetch on mutations)
- "Promote" moves top backlog item (by sort_order) to active
- If no backlog items, show "No backlog items" instead of Promote button

**Acceptance Criteria**:
- [ ] Badge shows correct count of team members with capacity
- [ ] Badge hidden when count = 0
- [ ] Panel lists all team members with capacity
- [ ] Promote action works correctly
- [ ] Real-time updates on item completion/creation

**Error Handling**:
- Promote when no backlog → toast "No backlog items for [Name]"
- Promote when at capacity → should not happen (button hidden), but 400 if attempted

---

## 4. Technical Requirements

### TR-001: API Specifications

**Base URL**: `/api/v1`

**Authentication**: Bearer token (Supabase JWT)

```
POST /api/v1/actions
Request:
  - description: string (required, 5-500 chars)
  - due_date: string (required, ISO 8601 date)
  - notes: string (optional, max 2000 chars)
  - owner_id: string (required if PM, auto-set if team member)
  - client_visible: boolean (optional, default false)
Response:
  - 201: { data: Action }
  - 400: { error: { code: "VALIDATION_ERROR", message: "...", fields: {...} } }
  - 401: { error: { code: "UNAUTHORIZED", message: "Authentication required" } }

GET /api/v1/actions
Query params:
  - status: string (optional)
  - owner_id: string (optional, PM only)
  - due_from: string (optional, ISO date)
  - due_to: string (optional, ISO date)
  - sort: string (optional, e.g., "due_date:asc")
  - page: number (optional, default 1)
  - limit: number (optional, default 20, max 100)
Response:
  - 200: { data: Action[], meta: { total, page, limit, pages } }

PATCH /api/v1/actions/:id
Request:
  - Any updatable field
  - delay_reason: string (required if status changing to 'delayed')
Response:
  - 200: { data: Action }
  - 400: { error: {...} }
  - 403: { error: { code: "FORBIDDEN", message: "Not authorized" } }
  - 404: { error: { code: "NOT_FOUND", message: "Action not found" } }

DELETE /api/v1/actions/:id
Response:
  - 204: (no content)
  - 403: { error: {...} }
  - 404: { error: {...} }

POST /api/v1/actions/:id/five-whys
Request:
  - whys: [{ level: number, response: string }]
  - root_cause_identified: boolean
Response:
  - 201: { data: FiveWhysAnalysis }
  - 403: { error: {...} } (if not PM)

GET /api/v1/insights
Query params:
  - date_from: string (optional)
  - date_to: string (optional)
  - owner_id: string (optional)
Response:
  - 200: { data: InsightsPayload }

GET /api/v1/actions/export
Query params: (same as GET /actions)
Response:
  - 200: text/csv file download

POST /api/v1/users/invite
Request:
  - email: string (required, valid email)
Response:
  - 201: { data: { invite_id, email, expires_at } }
  - 400: { error: {...} }
  - 403: { error: {...} } (if not PM)
```

---

### TR-002: Data Models

```sql
-- Users (extends Supabase auth.users)
profiles:
  - id: UUID (primary key, references auth.users.id)
  - email: string (unique)
  - full_name: string (max 100)
  - role: enum ('team_member', 'pm')
  - status: enum ('active', 'pending', 'deactivated')
  - created_at: timestamp
  - updated_at: timestamp

-- Core actions table
actions:
  - id: UUID (primary key, default gen_random_uuid())
  - description: text (not null, check length 5-500)
  - owner_id: UUID (foreign key → profiles.id, not null)
  - due_date: date (not null)
  - status: enum ('on_target', 'delayed', 'complete') default 'on_target'
  - notes: text (max 2000)
  - client_visible: boolean (default false)
  - auto_flagged: boolean (default false)
  - completed_at: timestamp (null)
  - created_at: timestamp (default now())
  - updated_at: timestamp (default now())

-- Delay reasons (1:many with actions)
delay_reasons:
  - id: UUID (primary key)
  - action_id: UUID (foreign key → actions.id, not null)
  - reason: text (not null, min 10 chars)
  - category: enum (nullable, set by AI)
  - subcategory: text (nullable)
  - confidence: float (nullable, 0-1)
  - ai_overridden: boolean (default false)
  - manual_category: enum (nullable)
  - created_at: timestamp
  - created_by: UUID (foreign key → profiles.id)

-- 5 Whys analysis
five_whys_analyses:
  - id: UUID (primary key)
  - action_id: UUID (foreign key → actions.id, not null)
  - conducted_by: UUID (foreign key → profiles.id, not null)
  - root_cause_identified: boolean (default false)
  - created_at: timestamp

five_whys_responses:
  - id: UUID (primary key)
  - analysis_id: UUID (foreign key → five_whys_analyses.id)
  - level: integer (1-5)
  - response: text (20-500 chars)
  - created_at: timestamp

-- Due date change history
due_date_history:
  - id: UUID (primary key)
  - action_id: UUID (foreign key → actions.id)
  - old_due_date: date
  - new_due_date: date
  - changed_by: UUID (foreign key → profiles.id)
  - created_at: timestamp

-- User invitations
invitations:
  - id: UUID (primary key)
  - email: string (not null)
  - invited_by: UUID (foreign key → profiles.id)
  - token: string (unique, for magic link)
  - expires_at: timestamp
  - accepted_at: timestamp (null)
  - created_at: timestamp
```

**Indexes**:
```sql
CREATE INDEX idx_actions_owner_id ON actions(owner_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_due_date ON actions(due_date);
CREATE INDEX idx_actions_owner_status ON actions(owner_id, status);
CREATE INDEX idx_delay_reasons_action_id ON delay_reasons(action_id);
CREATE INDEX idx_delay_reasons_category ON delay_reasons(category);
```

---

### TR-003: Performance Requirements

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| Page Load | < 2s (p95) | Vercel Analytics |
| API Response (list) | < 500ms (p95) | API logging |
| API Response (single) | < 200ms (p95) | API logging |
| CSV Export (1000 rows) | < 5s | Manual testing |
| AI Categorization | < 5s async | Job monitoring |
| Concurrent Users | 10 | Load testing |
| Database Queries | < 100ms | Supabase dashboard |

---

### TR-004: Security Requirements

- [x] Authentication via Supabase Auth (JWT tokens)
- [x] Authorization via Supabase RLS policies
- [x] Row Level Security on all tables
- [x] HTTPS enforced (Vercel default)
- [x] Input validation on all endpoints (Zod schemas)
- [x] SQL injection prevention (parameterized queries via Supabase client)
- [x] XSS prevention (React's default escaping + CSP headers)
- [x] CSRF protection (SameSite cookies)
- [x] Rate limiting: 100 requests/minute per user
- [x] Password: min 8 chars, 1 number, 1 special char
- [x] Session expiry: 7 days, refresh token rotation
- [x] Invite tokens: cryptographically random, single-use

---

### TR-005: DataTable Component Specification

**Component Architecture**:
```
src/components/ui/data-table/
├── data-table.tsx          # Main generic component
├── data-table-header.tsx   # Sortable column headers
├── data-table-toolbar.tsx  # Search + filters bar
├── data-table-body.tsx     # Rows with inline editing
├── data-table-footer.tsx   # Quick-add row
├── data-table-pagination.tsx # Pagination controls
├── editable-cell.tsx       # Generic inline edit cell
├── use-data-table.ts       # Hook for table state management
└── types.ts                # TypeScript interfaces
```

**Technology Stack**:
- @tanstack/react-table v8 (headless table logic)
- @tanstack/react-query (server state, optimistic updates)
- react-hook-form + zod (inline edit validation)
- shadcn/ui (Table, Input, Select, Popover, Calendar, Badge)
- nuqs (URL state persistence for filters/sort)

**Inline Editing Specification**:

| Cell Type | Edit Trigger | Edit Component | Save Trigger |
|-----------|--------------|----------------|--------------|
| Status | Click badge | Select dropdown | Selection change |
| Notes | Click text | Textarea (auto-expand) | Blur or Enter |
| Due Date | Click date | Calendar popover | Date selection |

**Quick-Add Footer Specification**:

| Field | Component | Validation | Default |
|-------|-----------|------------|---------|
| Description | Input | min 5 chars, max 500 | (empty) |
| Due Date | DatePicker | today or future | tomorrow |
| Assignee | Select | valid user ID | current user |

**Filter Behavior**:

```typescript
interface DataTableFilterConfig {
  searchField: string;           // e.g., "description"
  searchPlaceholder: string;     // e.g., "Search actions..."
  columnFilters: {
    field: string;               // e.g., "status"
    type: "select" | "date-range";
    options?: { label: string; value: string }[];
  }[];
  defaultFilters: {
    hideCompletedOlderThan?: number; // days, default 7
  };
}
```

**URL State Persistence**:
- `?sort=due_date:asc` - current sort
- `?status=delayed` - status filter
- `?q=meeting` - search query
- `?showAllCompleted=true` - completed filter toggle

**Accessibility Requirements**:
- All interactive elements keyboard accessible
- ARIA labels on sortable headers ("Sort by Due Date")
- Focus management during inline edit
- Screen reader announcements for sort/filter changes

---

### TR-006: Drag-and-Drop Implementation

**Technology Stack**:
- @dnd-kit/core (drag-and-drop primitives)
- @dnd-kit/sortable (sortable list utilities)
- @dnd-kit/utilities (CSS transforms)

**Component Architecture**:
```
src/components/ui/data-table/
├── sortable-row.tsx       # Wrapper for draggable table rows
├── drag-handle.tsx        # Grip icon with drag listeners
└── use-table-dnd.ts       # Hook for DnD state management
```

**Drag Interaction Specification**:

| Action | Mouse | Keyboard | Touch |
|--------|-------|----------|-------|
| Start drag | Click + hold handle | Enter on handle | Long press handle |
| Move item | Drag cursor | Arrow keys | Drag finger |
| Drop item | Release | Enter | Release |
| Cancel | Escape | Escape | Drag to edge |

**Visual Feedback**:
- Dragging row: `opacity: 0.8`, `box-shadow: lg`, `scale: 1.02`
- Drop indicator: `border-top: 2px solid primary`
- Invalid drop zone: `cursor: not-allowed`

**Performance**:
- Use CSS transforms (not position) for smooth 60fps
- Virtualization compatible (if list > 100 items)
- Debounce API calls: save after 300ms of no movement

**Accessibility**:
- `aria-grabbed` on draggable rows
- `aria-dropeffect="move"` on valid drop zones
- Live region announces: "Item grabbed", "Moved to position X", "Item dropped"

---

### TR-007: Backlog Data Model

**Schema Changes**:
```sql
-- Migration: 002_add_priority_and_backlog.sql
ALTER TABLE actions
  ADD COLUMN is_backlog BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN sort_order INTEGER;

-- Backlog index for tab filtering
CREATE INDEX idx_actions_is_backlog ON actions(is_backlog);

-- Sort order index for active items only
CREATE INDEX idx_actions_sort_order ON actions(sort_order)
  WHERE is_backlog = FALSE;

-- Composite index for common query pattern
CREATE INDEX idx_actions_owner_backlog ON actions(owner_id, is_backlog);

-- Initialize sort_order for existing active items
UPDATE actions
SET sort_order = row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY due_date ASC) as row_number
  FROM actions
  WHERE is_backlog = FALSE
) AS ordered
WHERE actions.id = ordered.id;
```

**Updated Actions Interface**:
```typescript
interface Action {
  id: string;
  description: string;
  owner_id: string;
  due_date: string;
  status: "on_target" | "delayed" | "complete";
  notes: string | null;
  client_visible: boolean;
  auto_flagged: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  is_backlog: boolean;
  sort_order: number | null;
}
```

**Query Patterns**:
```typescript
// Active items (sorted by priority)
const activeQuery = supabase
  .from("actions")
  .select("*")
  .eq("is_backlog", false)
  .order("sort_order", { ascending: true });

// Backlog items (sorted by due date)
const backlogQuery = supabase
  .from("actions")
  .select("*")
  .eq("is_backlog", true)
  .order("due_date", { ascending: true });

// Capacity check
const capacityQuery = supabase
  .from("actions")
  .select("owner_id, count(*)")
  .eq("is_backlog", false)
  .neq("status", "complete")
  .group("owner_id");
```

**API Endpoints**:
```
PATCH /api/v1/actions/reorder
Request:
  - items: [{ id: UUID, sort_order: number }]
Response:
  - 200: { data: { updated: number } }
  - 403: { error: "PM role required" }

PATCH /api/v1/actions/:id/backlog
Request:
  - is_backlog: boolean
Response:
  - 200: { data: Action }
  - 400: { error: "WIP limit reached" } (if moving to active when at 3)

GET /api/v1/team/capacity
Response:
  - 200: { data: [{ user_id, name, active_count, top_backlog }] }
```

---

## 5. UI/UX Requirements

### Screen: Login Page

**Purpose**: Authenticate users

**Components**:
- Email input field
- Password input field
- "Log In" button
- "Forgot Password" link
- Error message display area

**States**:
- Default: Empty form
- Loading: Button shows spinner, inputs disabled
- Error: Red border on invalid field, error message below
- Success: Redirect to Actions list

---

### Screen: Actions List (Main)

**Purpose**: View and manage actions

**Layout**:
- Header: App logo, user name, capacity badge (PM only), logout button
- Tab toggle: Active / Backlog tabs with counts
- Toolbar: Search input, Status filter (autocomplete), "Show completed" toggle, Owner filter (PM only)
- Actions table: Sortable columns with inline editing, drag handles for PM
- Quick-add footer: Inline form for rapid action creation
- Pagination: Page numbers, items per page selector

**Tab Toggle**:
| Tab | Filter | Sort | Badge |
|-----|--------|------|-------|
| Active | is_backlog = false | sort_order ASC | Count of active items |
| Backlog | is_backlog = true | due_date ASC | Count of backlog items |

**Table Columns**:
| Column | Width | Sortable | Editable | Notes |
|--------|-------|----------|----------|-------|
| ⠿ (drag) | 40px | No | No | PM only: Drag to reorder, cursor: grab |
| Status | 100px | Yes | Yes (dropdown) | Colored badge (green/yellow/gray), click to change |
| Description | flex | No | No | Truncate at 80 chars, tooltip on hover |
| Assignee | 140px | Yes | No | Avatar + name (PM sees all, team member sees own) |
| Due Date | 120px | Yes | Yes (date picker) | Red if overdue, click to change |
| Notes | 150px | No | Yes (text input) | Truncate at 30 chars, click to edit |
| Actions | 80px | No | No | Edit link + Trash icon |

**Drag Handle Column (PM Only)**:
| Property | Value |
|----------|-------|
| Column | ⠿ (grip icon) |
| Width | 40px |
| Visible To | PM only (hidden for team members) |
| Behavior | Drag to reorder, cursor changes to grab/grabbing |
| Accessibility | Enter to pick up, arrows to move, Enter to drop |

**Capacity Badge (PM Only)**:
| Property | Value |
|----------|-------|
| Location | Header, next to user menu |
| Format | Orange badge with number (e.g., "3") |
| Tooltip | "3 team members ready for more work" |
| Click | Opens Capacity Panel popover |
| Hidden | When all team members are at capacity (3 items each) |

**Toolbar Specification**:
- Search input: Filters by description text, debounced (300ms)
- Status filter: Autocomplete dropdown with On Target, Delayed, Complete options
- "Show completed" toggle: Default OFF (hides completed items >7 days old)
- Owner filter (PM only): Dropdown of all team members

**Quick-Add Footer**:
| Field | Component | Placeholder | Required |
|-------|-----------|-------------|----------|
| Description | Input | "Add new action..." | Yes |
| Due Date | DatePicker | Tomorrow | Yes |
| Assignee | Select | Current user | Yes (PM only visible) |
| Add button | IconButton | "+" | - |

**Inline Editing Interactions**:
- Status: Click badge → dropdown appears → select new status → auto-save
- Notes: Click text → input appears with current value → edit → blur or Enter to save
- Due Date: Click date → calendar popover → select date → auto-save
- All edits use optimistic updates with rollback on error

**User Flow**:
1. User lands on list, sees their actions (or all if PM)
2. User can sort by clicking column headers (toggle asc/desc)
3. User can filter using toolbar (search, status, completed toggle)
4. User can inline-edit Status, Notes, or Due Date by clicking the cell
5. User can add new action via quick-add footer row
6. User clicks Edit link to open full edit modal
7. User clicks Trash icon to delete (with confirmation)

**States**:
- Loading: Skeleton table rows
- Empty: Illustration + "No actions yet. Create your first one!"
- Error: "Failed to load actions. Retry" button
- Filtered Empty: "No actions match filters. Clear filters"
- Saving: Cell shows spinner during save
- Save Error: Toast notification with "Retry" option, cell reverts

---

### Screen: Action Form (Create/Edit)

**Purpose**: Create or edit an action

**Components**:
- Description textarea (5-500 chars, char counter)
- Due Date picker (calendar widget)
- Status dropdown (edit only)
- Delay Reason textarea (appears when Delayed selected)
- Notes textarea (optional, 2000 chars)
- Owner dropdown (PM only)
- "Client Visible" checkbox (PM only)
- Save button, Cancel button

**Validation**:
- Real-time validation on blur
- Save button disabled until form valid
- Error messages inline below fields

**States**:
- Create: Empty form, "Create Action" title
- Edit: Pre-populated, "Edit Action" title
- Saving: Button shows spinner
- Error: Toast notification with retry option
- Success: Redirect to list with success toast

---

### Screen: Weekly Review Mode

**Purpose**: PM reviews delayed items systematically

**Layout**:
- Header: "Weekly Review" title, Exit button
- Summary bar: X delayed items, Y reviewed this session
- Action cards: One at a time, carousel-style
- Navigation: Previous, Next buttons, progress indicator

**Action Card Contents**:
- Full description
- Owner name
- Due date (days overdue)
- Current delay reason
- Category (AI-assigned)
- Previous 5 Whys (collapsible)
- "Start 5 Whys" button

**User Flow**:
1. PM clicks "Weekly Review" from main screen
2. First delayed item shown as card
3. PM reads details, clicks "Start 5 Whys" or "Skip"
4. After review, clicks "Next" for next item
5. Progress indicator shows X of Y
6. End: Summary of session (X reviewed, Y analyzed)

---

### Screen: 5 Whys Modal

**Purpose**: Guided root cause analysis

**Layout**:
- Modal overlay (prevents background interaction)
- Action summary at top (description, delay reason)
- Current "Why" prompt with level indicator (1/5)
- Response textarea (20-500 chars)
- Continue button, "Root Cause Found" button, Cancel button

**User Flow**:
1. Modal opens with Why #1 prompt
2. PM types response, clicks Continue
3. System shows Why #2 with previous response visible
4. Repeat up to Why #5
5. PM can click "Root Cause Found" at any level
6. Confirmation: Save and return to review

**States**:
- In Progress: Textarea enabled, buttons active
- Saving: Spinner on Continue button
- Complete: "Analysis Saved" message, auto-close

---

### Screen: Coaching Insights Panel

**Purpose**: Show delay patterns

**Layout** (sidebar or separate page):
- Date range selector
- Owner filter (optional)
- Top Categories chart (horizontal bar)
- Trend indicators (up/down arrows)
- Recurring Issues list (expandable)
- Team Health Score (gauge or number)

**Interactivity**:
- Click category bar → drill-down to actions in that category
- Click recurring issue → shows related actions
- Hover on trend → tooltip with comparison data

---

### Screen: Team Management (PM Only)

**Purpose**: Manage user accounts

**Components**:
- User table: Name, Email, Role, Status, Actions
- "Invite User" button
- Invite modal: Email input, Send button

**User Table Columns**:
- Name
- Email
- Role (team_member, pm)
- Status (active, pending, deactivated)
- Actions: Resend Invite, Deactivate, Reactivate

---

### Screen: Capacity Panel (PM Only)

**Purpose**: Show team members with capacity and enable backlog promotion

**Trigger**: Click capacity badge in header

**Layout** (Popover, 400px wide):
- Header: "Team Capacity" + close button
- List of team members with capacity (<3 active items)

**List Item Contents**:
| Element | Description |
|---------|-------------|
| Avatar | User profile image (32px) |
| Name | Full name |
| Capacity | "2/3 active" with progress bar |
| Top Backlog | Description truncated (40 chars) or "No backlog items" |
| Promote | Button (if backlog exists) |

**User Flow**:
1. PM sees capacity badge "3" in header
2. PM clicks badge → Capacity Panel opens
3. Panel shows: Alice (2/3), Bob (1/3), Carol (2/3)
4. PM clicks "Promote" next to Bob
5. Bob's top backlog item moves to active (2/3)
6. Badge updates to "2"

**States**:
- Loading: Skeleton list
- Empty: "All team members are at full capacity"
- Error: "Failed to load capacity. Retry"

---

## 6. Integration Requirements

### INT-001: Supabase Auth

**Purpose**: User authentication and session management
**Direction**: Bidirectional
**Protocol**: Supabase JS SDK

**Data Exchange**:
- Sign up/in: email, password → JWT token
- Session: auto-refresh on client
- User metadata: role stored in profiles table

**Error Handling**:
- Invalid credentials → "Invalid email or password"
- Expired session → redirect to login
- Rate limited → "Too many attempts, try again in X minutes"

---

### INT-002: AI Categorization (Future)

**Purpose**: Categorize delay reasons automatically
**Direction**: Outbound (request) / Inbound (response)
**Protocol**: HTTP POST to AI endpoint (Claude API or custom)

**Data Exchange**:
- Request: { delay_reason, action_context }
- Response: { category, subcategory, confidence }
- Frequency: On delay reason create/update

**Error Handling**:
- AI unavailable → queue for retry, show "Categorizing..." in UI
- Timeout (>10s) → mark as "uncategorized", log for review
- Low confidence → flag for PM manual review

**Note**: For MVP, can use rule-based categorization with keyword matching. AI integration can be Phase 1.5.

---

## 7. Non-Functional Requirements

### NFR-001: Scalability
- Support 6-10 concurrent users
- Handle 1,000+ actions without performance degradation
- Database can grow to 10,000 actions (1 year of data)

### NFR-002: Maintainability
- TypeScript strict mode enabled
- ESLint + Prettier enforced
- Component-based architecture (atomic design)
- API routes follow RESTful conventions
- Database migrations tracked in version control

### NFR-003: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactions
- Screen reader compatible (ARIA labels)
- Color contrast ratios meet standards
- Focus indicators visible

### NFR-004: Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- No IE11 support

### NFR-005: Observability
- Error tracking (Vercel or Sentry)
- API request logging (response times, status codes)
- User action analytics (optional, privacy-conscious)

---

## 8. Out of Scope

Explicitly NOT included in Phase 1:
- **Slack integration** → Phase 2 (Daily Brief)
- **Customer-facing views** → Phase 3 (Client View)
- **Datadog integration** → Phase 4 (Issues)
- **Mobile responsive design** → Future
- **Email notifications** → Phase 2
- **Bulk actions** → Future (if needed)
- **Action attachments/files** → Future
- **Comments on actions** → Future
- **Action templates** → Future
- **Time tracking** → Not planned
- **Calendar integration** → Not planned

---

## 9. Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Supabase project | Technical | Patrick | To be created |
| Vercel account | Technical | Patrick | Existing |
| Domain name | Technical | Patrick | TBD |
| AI API key (if using) | Technical | Patrick | TBD |
| Team member list | Business | Patrick | Available |

---

## 10. Success Metrics (Phase 1)

| Metric | Baseline | Target | Owner |
|--------|----------|--------|-------|
| Actions created | 0 | 50+ in first 2 weeks | Patrick |
| Daily active users | 0 | 6+ by end of Week 2 | Patrick |
| Delayed items with 5 Whys | 0 | 80% of delayed items analyzed | Patrick |
| Weekly review completed | 0 | 2 (one per week) | Patrick |
| Spreadsheet retired | No | Yes | Patrick |

---

## 11. Open Questions

- [x] Delay reason categories - **Resolved**: Freeform + AI categorization
- [x] 5 Whys flow design - **Resolved**: Guided prompts up to 5 levels
- [x] Export format - **Resolved**: CSV only
- [x] Client visibility tagging - **Resolved**: Boolean checkbox
- [x] UI layout - **Resolved**: Table view
- [x] User onboarding - **Resolved**: Admin invite only
- [x] Notifications - **Resolved**: None in Phase 1
- [ ] AI provider for categorization - TBD (can use rules-based for MVP)
- [ ] Domain name - TBD
- [ ] Team member email list - Patrick to provide

---

## 12. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | February 1, 2026 | Patrick Salazar | Added US-016 (PM Drag-and-Drop Reordering), US-017 (Backlog Management), US-018 (Capacity Notification), FR-010 (Drag-and-Drop Priority Ordering), FR-011 (Active/Backlog Status Management), FR-012 (Capacity Alert System), TR-006 (Drag-and-Drop Implementation), TR-007 (Backlog Data Model), updated Actions List UI/UX with tabs and drag handles, added Capacity Panel screen |
| 1.1 | February 1, 2026 | Patrick Salazar | Added US-015 (Enhanced Action Register Table), FR-009 (Reusable DataTable Component), TR-005 (DataTable Component Specification), updated Actions List UI/UX with inline editing and quick-add footer |
| 1.0 | February 1, 2026 | Patrick Salazar | Initial draft |

---

## Appendix A: Delay Category Definitions

| Category | Subcategory | Description | Example |
|----------|-------------|-------------|---------|
| people | waiting_on_others | Blocked by another team member | "Waiting for John's API spec" |
| people | handoff_delay | Transition between owners | "Reassigned mid-sprint" |
| people | availability | Resource not available | "Owner on PTO" |
| process | unclear_requirements | Scope or spec unclear | "Need clarity on edge cases" |
| process | approval_blocked | Waiting for sign-off | "Pending PM approval" |
| process | dependencies | Blocked by other tasks | "Depends on auth module" |
| technical | bug_found | Discovered defect | "Found regression in testing" |
| technical | complexity_underestimated | Harder than expected | "More edge cases than anticipated" |
| technical | technical_debt | Existing code issues | "Legacy code requires refactor" |
| capacity | competing_priorities | Other work took precedence | "Pulled to urgent customer issue" |
| capacity | time_constraint | Not enough hours | "Insufficient time allocated" |
| capacity | resource_shortage | Missing skills/tools | "Need DBA support" |
| external | vendor_delay | Third-party dependency | "Waiting on vendor response" |
| external | customer_dependency | Customer input needed | "Need customer test data" |
| external | third_party | External system issue | "API rate limited" |
| other | uncategorized | Doesn't fit categories | Edge cases |

---

## Appendix B: Rule-Based Categorization (MVP Alternative)

If AI categorization is deferred, use keyword matching:

```typescript
const categoryRules = {
  people: ['waiting on', 'blocked by', 'need from', 'handoff', 'pto', 'vacation'],
  process: ['unclear', 'requirements', 'approval', 'depends on', 'blocked'],
  technical: ['bug', 'regression', 'complex', 'refactor', 'technical debt'],
  capacity: ['priority', 'urgent', 'time', 'bandwidth', 'competing'],
  external: ['vendor', 'customer', 'third party', 'api', 'external'],
};
```

Match first category with keyword found. Confidence = 0.8 for match, 0.5 for partial.

---

*MiseKai: Preparation meets continuous improvement.*
