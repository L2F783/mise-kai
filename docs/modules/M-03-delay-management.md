# Module M-03: Delay Management

## Overview

Handles action status transitions with special handling for the "Delayed" status, which requires a reason. Implements the auto-flagging system that marks overdue items as delayed with a system-generated reason.

## Dependencies

### Required (must complete first)
- M-01: Foundation & Auth - Provides: database schema, auth, delay_reasons table
- M-02: Action CRUD - Provides: actions API, actions table, status badge component

### Optional (nice to have)
- None

## Scope

### Files to Create
- `src/components/actions/DelayReasonModal.tsx` - Modal for capturing delay reason
- `src/components/actions/StatusDropdown.tsx` - Status change with delay handling
- `src/app/api/actions/[id]/status/route.ts` - Dedicated status change endpoint
- `src/lib/actions/delay.ts` - Delay reason handling functions
- `src/lib/cron/auto-flag.ts` - Auto-flagging logic (for Vercel Cron)
- `src/app/api/cron/auto-flag/route.ts` - Cron endpoint for auto-flagging
- `vercel.json` - Cron job configuration

### Files to Modify
- `src/components/actions/ActionsTable.tsx` - Integrate StatusDropdown
- `src/components/actions/ActionRow.tsx` - Show delay reason indicator
- `src/app/api/actions/[id]/route.ts` - Add delay reason handling to PATCH
- `src/types/database.ts` - Add delay reason types if needed

### Out of Scope for This Module
- AI categorization of delay reasons (M-05)
- 5 Whys analysis (M-05)
- Delay insights/patterns (M-05)
- PM override of categories (M-05)

## Inputs

This module receives:
- Actions from M-02
- Status change requests from users
- Cron trigger from Vercel scheduler

## Outputs

This module produces:
- Delay reason modal component
- Status change flow with delay reason capture
- Delay reasons stored in database
- Auto-flagged overdue items (daily)
- API for status transitions

## Functional Requirements

From PRD, this module implements:
- FR-002: Status Transition with Delay Reason
- US-003: Team Member Updates Action Status
- US-004: System Auto-Flags Delayed Items

## Technical Specifications

### API Endpoints

```typescript
// PATCH /api/actions/:id/status - Change action status
Request:
  - status: 'on_target' | 'delayed' | 'complete' (required)
  - delay_reason?: string (required if status = 'delayed', min 10 chars)
Response:
  - 200: { data: Action, delay_reason?: DelayReason }
  - 400: { error: { code: "VALIDATION_ERROR", message: "Delay reason required (min 10 characters)" } }
  - 403: { error: {...} }
  - 404: { error: {...} }

// GET /api/cron/auto-flag - Auto-flag overdue items (Vercel Cron)
Headers:
  - Authorization: Bearer CRON_SECRET
Response:
  - 200: { flagged_count: number, action_ids: string[] }
  - 401: { error: "Unauthorized" }
```

### Status Transition Rules

```typescript
type Status = 'on_target' | 'delayed' | 'complete';

const transitions: Record<Status, Status[]> = {
  'on_target': ['delayed', 'complete'],
  'delayed': ['on_target', 'complete'],
  'complete': ['on_target', 'delayed'],
};

// Business rules:
// - on_target → delayed: requires delay_reason
// - delayed → on_target: clears active delay, preserves history
// - * → complete: sets completed_at
// - complete → *: clears completed_at
// - auto_flagged = true when system sets to delayed
```

### Delay Reason Schema

```typescript
import { z } from 'zod';

export const delayReasonSchema = z.object({
  reason: z.string()
    .min(10, 'Delay reason must be at least 10 characters')
    .max(500, 'Delay reason must be at most 500 characters'),
});

export const statusChangeSchema = z.object({
  status: z.enum(['on_target', 'delayed', 'complete']),
  delay_reason: z.string().min(10).max(500).optional(),
}).refine(
  (data) => data.status !== 'delayed' || !!data.delay_reason,
  { message: 'Delay reason is required when status is delayed', path: ['delay_reason'] }
);
```

### Auto-Flag Cron Job

```typescript
// Runs daily at midnight UTC
// vercel.json
{
  "crons": [{
    "path": "/api/cron/auto-flag",
    "schedule": "0 0 * * *"
  }]
}

// Logic:
// 1. Find actions where due_date < today AND status = 'on_target'
// 2. For each:
//    - Set status = 'delayed'
//    - Set auto_flagged = true
//    - Create delay_reason with reason = "Auto-flagged: past due date"
// 3. Return count of flagged items
```

### Component Structure

```typescript
// DelayReasonModal props
interface DelayReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  actionDescription: string;
}

// StatusDropdown props
interface StatusDropdownProps {
  currentStatus: Status;
  onStatusChange: (newStatus: Status, delayReason?: string) => Promise<void>;
  disabled?: boolean;
}
```

### Visual Indicators

```typescript
// Status badge colors (extend from M-02)
const statusColors = {
  on_target: 'bg-green-100 text-green-800',
  delayed: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-gray-100 text-gray-800',
};

// Delay indicator - small icon next to delayed items
// Hover shows delay reason preview
// Click opens full delay reason (could expand to show history)
```

## Acceptance Criteria

All must pass for module completion:

- [ ] Status dropdown shows all valid transitions
- [ ] Selecting "Delayed" opens delay reason modal
- [ ] Delay reason modal validates minimum 10 characters
- [ ] Delay reason saved to delay_reasons table
- [ ] Delay reason linked to action and current user
- [ ] "On Target" from "Delayed" preserves delay history
- [ ] "Complete" sets completed_at timestamp
- [ ] Re-opening "Complete" clears completed_at
- [ ] Auto-flag cron runs successfully
- [ ] Auto-flagged items have auto_flagged = true
- [ ] Auto-flagged items have system delay reason
- [ ] Users can update auto-generated delay reason
- [ ] Delay indicator visible on delayed actions
- [ ] All unit tests pass
- [ ] Integration tests pass

## Verification

### Unit Tests Required
- [ ] statusChangeSchema validates delay_reason requirement
- [ ] StatusDropdown shows correct transition options
- [ ] DelayReasonModal validates minimum length
- [ ] Auto-flag query finds correct actions

### Integration Tests Required
- [ ] Status change to delayed creates delay_reason record
- [ ] Status change to on_target preserves delay history
- [ ] Status change to complete sets timestamp
- [ ] Auto-flag endpoint marks correct actions
- [ ] Auto-flag creates system delay reasons

### Manual Verification
- [ ] Status dropdown click shows options
- [ ] Delay reason modal opens when selecting Delayed
- [ ] Cannot submit modal with <10 chars
- [ ] Delay indicator appears on delayed items
- [ ] Hovering shows delay reason preview
- [ ] Auto-flagged items distinguishable (optional visual)

## Estimated Effort

- **Complexity**: M (Medium)
- **Estimated Effort**: 1-2 days
- **Risk Level**: Low

## Implementation Notes

1. **Modal Focus**: When delay reason modal opens, focus the textarea automatically.

2. **Character Counter**: Show character count in delay reason modal (10 min, 500 max).

3. **Cron Security**: Protect cron endpoint with CRON_SECRET environment variable.

4. **Timezone Handling**: Auto-flag should use UTC for consistency. Consider user timezone for display.

5. **Delay History**: Store all delay reasons, not just the latest. Show history in a collapsible section (can be deferred to polish).

6. **Optimistic UI**: Show status change immediately, revert if API fails.

7. **Toast Notifications**: Show success/error toasts on status change.

## Open Questions

- [ ] Should auto-flag run at a specific time or use user timezone? (Recommendation: UTC midnight)
- [ ] Show delay history inline or in a modal? (Recommendation: Defer to M-06, just show latest for now)
