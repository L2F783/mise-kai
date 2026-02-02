# Module M-02: Action CRUD

## Overview

Implements core action management functionality: creating, viewing, editing, and deleting actions. Team members see their own actions in a sortable table view with inline editing capabilities.

## Dependencies

### Required (must complete first)
- M-01: Foundation & Auth - Provides: database schema, auth, base UI components, TypeScript types

### Optional (nice to have)
- None

## Scope

### Files to Create
- `src/app/actions/page.tsx` - Actions list page
- `src/app/actions/new/page.tsx` - Create action page
- `src/app/actions/[id]/page.tsx` - View/edit action page
- `src/app/actions/[id]/edit/page.tsx` - Edit action page (alternative to modal)
- `src/app/api/actions/route.ts` - Actions API (GET list, POST create)
- `src/app/api/actions/[id]/route.ts` - Single action API (GET, PATCH, DELETE)
- `src/components/actions/ActionsTable.tsx` - Sortable actions table
- `src/components/actions/ActionRow.tsx` - Table row component
- `src/components/actions/ActionForm.tsx` - Create/edit form
- `src/components/actions/ActionStatusBadge.tsx` - Status indicator
- `src/components/actions/EmptyState.tsx` - No actions illustration
- `src/lib/validations/action.ts` - Zod validation schemas
- `src/lib/actions/queries.ts` - Database query functions
- `src/hooks/useActions.ts` - Actions data hook (React Query or SWR)

### Files to Modify
- `src/app/layout.tsx` - Add actions link to navigation
- `src/components/layout/Header.tsx` - Add navigation items

### Out of Scope for This Module
- Status change to "Delayed" (requires delay reason - M-03)
- Auto-flagging overdue items (M-03)
- Owner dropdown/assignment (M-04)
- View all actions (M-04)
- Filtering by owner (M-04)

## Inputs

This module receives:
- Authenticated user session from M-01
- Database connection from M-01
- Base UI components from M-01

## Outputs

This module produces:
- Actions list page with sortable table
- Create action form and flow
- Edit action form and flow
- Delete action functionality
- API endpoints for actions CRUD

## Functional Requirements

From PRD, this module implements:
- FR-001: Action CRUD Operations (partial - team member scope)
- FR-004: Filtering and Sorting (partial - basic sorting)
- US-001: Team Member Views Personal Actions
- US-002: Team Member Creates Action

## Technical Specifications

### API Endpoints

```typescript
// POST /api/actions - Create action
Request:
  - description: string (required, 5-500 chars)
  - due_date: string (required, ISO 8601 date, today or future)
  - notes?: string (max 2000 chars)
Response:
  - 201: { data: Action }
  - 400: { error: { code: "VALIDATION_ERROR", message: "...", fields: {...} } }
  - 401: { error: { code: "UNAUTHORIZED", message: "Authentication required" } }

// GET /api/actions - List user's actions
Query params:
  - status?: 'on_target' | 'delayed' | 'complete' | 'all'
  - sort?: 'due_date' | 'created_at' | 'status' (default: 'due_date')
  - order?: 'asc' | 'desc' (default: 'asc')
  - page?: number (default: 1)
  - limit?: number (default: 20, max: 100)
Response:
  - 200: { data: Action[], meta: { total, page, limit, pages } }

// GET /api/actions/:id - Get single action
Response:
  - 200: { data: Action }
  - 404: { error: { code: "NOT_FOUND", message: "Action not found" } }

// PATCH /api/actions/:id - Update action
Request:
  - description?: string
  - due_date?: string (tracks history if changed)
  - notes?: string
  - status?: 'on_target' | 'complete' (NOT 'delayed' - handled in M-03)
Response:
  - 200: { data: Action }
  - 400: { error: {...} }
  - 403: { error: { code: "FORBIDDEN", message: "Not authorized" } }
  - 404: { error: {...} }

// DELETE /api/actions/:id - Delete action
Response:
  - 204: (no content)
  - 400: { error: {...} } (if completed action)
  - 403: { error: {...} }
  - 404: { error: {...} }
```

### Validation Schema

```typescript
import { z } from 'zod';

export const createActionSchema = z.object({
  description: z.string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be at most 500 characters'),
  due_date: z.string()
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed >= today;
    }, 'Due date must be today or in the future'),
  notes: z.string().max(2000).optional(),
});

export const updateActionSchema = z.object({
  description: z.string().min(5).max(500).optional(),
  due_date: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['on_target', 'complete']).optional(),
});
```

### Component Structure

```typescript
// ActionsTable props
interface ActionsTableProps {
  actions: Action[];
  isLoading: boolean;
  sortBy: 'due_date' | 'created_at' | 'status';
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// ActionForm props
interface ActionFormProps {
  action?: Action; // undefined for create
  onSubmit: (data: ActionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
```

### Table Columns

| Column | Width | Sortable | Notes |
|--------|-------|----------|-------|
| Status | 100px | Yes | Colored badge |
| Description | flex | No | Truncate at 80 chars |
| Due Date | 100px | Yes | Red if overdue |
| Actions | 80px | No | Edit, Delete |

## Acceptance Criteria

All must pass for module completion:

- [ ] Actions list page displays user's actions only
- [ ] Table is sortable by Status, Due Date, Created Date
- [ ] Default sort is Due Date ascending
- [ ] Create action form validates required fields
- [ ] Create action sets owner_id to current user automatically
- [ ] Create action sets status to "on_target" by default
- [ ] Edit action pre-populates form with current values
- [ ] Due date change creates history entry
- [ ] Delete action works for non-completed actions
- [ ] Delete completed action shows error
- [ ] Empty state shown when no actions
- [ ] Loading skeleton shown while fetching
- [ ] Error state shown on fetch failure with retry button
- [ ] All API endpoints return correct status codes
- [ ] All unit tests pass
- [ ] Integration tests pass

## Verification

### Unit Tests Required
- [ ] createActionSchema validates correctly
- [ ] updateActionSchema validates correctly
- [ ] ActionsTable renders with actions
- [ ] ActionsTable handles empty state
- [ ] ActionForm validates on blur
- [ ] ActionForm disables submit until valid
- [ ] ActionStatusBadge renders correct colors

### Integration Tests Required
- [ ] Create action API returns 201 with valid data
- [ ] Create action API returns 400 with missing fields
- [ ] Get actions returns only current user's actions
- [ ] Update action records due_date_history on change
- [ ] Delete action returns 400 for completed actions
- [ ] Pagination works correctly

### Manual Verification
- [ ] Create action flow works end-to-end
- [ ] Edit action flow works end-to-end
- [ ] Delete confirmation modal appears
- [ ] Sorting persists across navigation
- [ ] Character counter works in description field
- [ ] Date picker blocks past dates on create

## Estimated Effort

- **Complexity**: M (Medium)
- **Estimated Effort**: 2 days
- **Risk Level**: Low

## Implementation Notes

1. **Status Change Restriction**: In this module, only allow status changes to 'on_target' or 'complete'. The 'delayed' status requires a delay reason and is handled in M-03.

2. **Due Date History**: When due_date changes, insert a record into due_date_history before updating the action.

3. **Soft Delete Consideration**: PRD says completed actions can't be deleted. Consider soft delete (is_deleted flag) vs. hard delete with check.

4. **Optimistic Updates**: Consider using optimistic updates for better UX, especially for status changes.

5. **React Query/SWR**: Recommend using React Query or SWR for data fetching with automatic cache invalidation.

6. **Truncation**: Use CSS text-overflow for description truncation, with title attribute for full text on hover.

## Open Questions

- [ ] Modal vs. separate page for create/edit? (Recommendation: Modal for quick create, page for detailed edit)
- [ ] Inline editing for quick updates? (Defer to M-06 polish phase)
