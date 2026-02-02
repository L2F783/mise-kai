# Module M-04: PM Features

## Overview

Enables PM-specific functionality: viewing all team members' actions, assigning actions to team members, inviting new users, conducting weekly reviews, and marking actions as customer-relevant. This module transforms the app from a personal task tracker to a team management tool.

## Dependencies

### Required (must complete first)
- M-01: Foundation & Auth - Provides: profiles table, role-based access, invitations table
- M-02: Action CRUD - Provides: actions API, actions table
- M-03: Delay Management - Provides: delay reasons, status handling

### Optional (nice to have)
- None

## Scope

### Files to Create
- `src/app/team/page.tsx` - Team management page
- `src/app/team/invite/page.tsx` - Invite user page (or modal)
- `src/app/review/page.tsx` - Weekly review mode
- `src/app/api/users/route.ts` - Users list API
- `src/app/api/users/invite/route.ts` - Invite user API
- `src/app/api/users/[id]/route.ts` - User management API
- `src/app/api/invitations/route.ts` - Invitations management
- `src/app/api/invitations/[token]/accept/route.ts` - Accept invitation
- `src/app/invite/[token]/page.tsx` - Invitation acceptance page
- `src/components/actions/OwnerDropdown.tsx` - Owner selection dropdown
- `src/components/actions/OwnerFilter.tsx` - Filter by owner
- `src/components/team/TeamTable.tsx` - Team members table
- `src/components/team/InviteForm.tsx` - Invite user form
- `src/components/review/ReviewCard.tsx` - Weekly review action card
- `src/components/review/ReviewProgress.tsx` - Review progress indicator
- `src/lib/validations/invite.ts` - Invitation validation schemas
- `src/lib/email/invite.ts` - Invitation email template
- `src/hooks/useTeam.ts` - Team data hook
- `src/hooks/useIsPM.ts` - PM role check hook

### Files to Modify
- `src/components/actions/ActionsTable.tsx` - Add Owner column for PM
- `src/components/actions/ActionForm.tsx` - Add Owner dropdown for PM
- `src/app/api/actions/route.ts` - Add owner_id support for PM
- `src/app/actions/page.tsx` - Add filters for PM view
- `src/components/layout/Header.tsx` - Add Team and Review links for PM

### Out of Scope for This Module
- 5 Whys analysis flow (M-05)
- Coaching insights (M-05)
- AI categorization (M-05)
- CSV export (M-06)

## Inputs

This module receives:
- User role from session (team_member vs pm)
- Actions data from M-02
- Delay data from M-03

## Outputs

This module produces:
- PM can view all team actions
- PM can assign/reassign actions
- PM can invite new team members
- PM can manage user status (active, deactivated)
- Weekly review mode for delayed items
- Client visibility toggle on actions

## Functional Requirements

From PRD, this module implements:
- FR-001: Action CRUD Operations (PM extensions)
- FR-004: Filtering and Sorting (owner filter)
- US-005: PM Views All Actions
- US-006: PM Assigns Action to Team Member
- US-007: PM Invites Team Members
- US-008: PM Runs Weekly Review
- US-014: Action Marked Customer-Relevant

## Technical Specifications

### API Endpoints

```typescript
// GET /api/users - List all users (PM only)
Response:
  - 200: { data: Profile[] }
  - 403: { error: "Not authorized" }

// POST /api/users/invite - Invite user (PM only)
Request:
  - email: string (required, valid email)
Response:
  - 201: { data: { invite_id, email, expires_at } }
  - 400: { error: { code: "VALIDATION_ERROR", ... } }
  - 403: { error: "Not authorized" }
  - 409: { error: "User already exists" }

// DELETE /api/users/invite/:id - Revoke invitation (PM only)
Response:
  - 204: (no content)
  - 403: { error: "Not authorized" }
  - 404: { error: "Invitation not found" }

// POST /api/users/invite/:id/resend - Resend invitation (PM only)
Response:
  - 200: { data: { invite_id, expires_at } }

// POST /api/invitations/:token/accept - Accept invitation
Request:
  - password: string (8+ chars, 1 number, 1 special)
  - full_name: string (required)
Response:
  - 201: { data: { user_id, email } }
  - 400: { error: "Invalid or expired invitation" }

// PATCH /api/users/:id - Update user (PM only)
Request:
  - status?: 'active' | 'deactivated'
  - role?: 'team_member' | 'pm'
Response:
  - 200: { data: Profile }
  - 403: { error: "Not authorized" }

// GET /api/actions with PM extensions
Query params (PM only):
  - owner_id?: string (filter by owner)
  - all?: boolean (include all users' actions)
Response:
  - 200: { data: Action[], meta: {...} }
```

### Filtering Logic

```typescript
// PM filter combinations (AND logic)
interface PMFilters {
  owner_id?: string;      // specific team member
  status?: Status;        // on_target, delayed, complete, all
  due_range?: 'this_week' | 'next_week' | 'overdue' | { start: Date, end: Date };
}

// Filter state in URL for bookmarking
// e.g., /actions?owner=uuid&status=delayed&due=overdue
```

### Invitation Flow

```typescript
// 1. PM enters email, clicks Invite
// 2. System creates invitation record with:
//    - Cryptographically random token
//    - expires_at = now + 7 days
// 3. System sends email with magic link: /invite/{token}
// 4. Recipient clicks link, sees acceptance page
// 5. Recipient enters name and password
// 6. System creates auth.user and profile
// 7. Invitation marked as accepted
// 8. User redirected to actions page
```

### Weekly Review Mode

```typescript
interface ReviewSession {
  delayedActions: Action[];
  currentIndex: number;
  reviewedIds: string[];
  skippedIds: string[];
  startedAt: Date;
}

// Entry point: "Weekly Review" button on main page
// Shows delayed items sorted by delay duration (longest first)
// Carousel-style navigation: Previous, Next
// Exit returns to main view with summary
```

### Component Structure

```typescript
// OwnerDropdown props
interface OwnerDropdownProps {
  value?: string;
  onChange: (ownerId: string) => void;
  teamMembers: Profile[];
  disabled?: boolean;
}

// OwnerFilter props (multi-select for filtering)
interface OwnerFilterProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  teamMembers: Profile[];
}

// ReviewCard props
interface ReviewCardProps {
  action: Action;
  delayReason?: DelayReason;
  previousAnalyses?: FiveWhysAnalysis[];
  onStartFiveWhys: () => void;
  onSkip: () => void;
  onNext: () => void;
}
```

## Acceptance Criteria

All must pass for module completion:

- [ ] PM sees "Owner" column in actions table
- [ ] PM can filter by owner (dropdown of team members)
- [ ] PM can filter by status (On Target, Delayed, Complete, All)
- [ ] PM can filter by due date (This Week, Next Week, Overdue, Custom)
- [ ] Filters are combinable (AND logic)
- [ ] Filter state persists in URL
- [ ] PM can assign owner when creating action
- [ ] PM can reassign existing actions to different owners
- [ ] Reassignment logged in action history
- [ ] PM can send invite email
- [ ] Invitation email contains valid magic link
- [ ] Invite link expires after 7 days
- [ ] PM can resend pending invites
- [ ] PM can revoke pending invites
- [ ] New user can accept invite and set password
- [ ] PM sees user status in team management
- [ ] PM can deactivate/reactivate users
- [ ] Weekly Review button enters review mode
- [ ] Review shows only delayed items
- [ ] Items sorted by delay duration (longest first)
- [ ] Review shows delay reason and category
- [ ] Progress indicator shows X of Y
- [ ] PM can mark action as client-visible
- [ ] Client visibility filter available
- [ ] All unit tests pass
- [ ] Integration tests pass

## Verification

### Unit Tests Required
- [ ] OwnerDropdown renders team members
- [ ] OwnerFilter handles multi-select
- [ ] Filter URL parsing works correctly
- [ ] ReviewCard renders action details
- [ ] Invitation token generation is cryptographically random

### Integration Tests Required
- [ ] PM sees all actions regardless of owner
- [ ] Team member cannot access PM endpoints (403)
- [ ] Invite creates valid invitation record
- [ ] Accept invite creates user with correct role
- [ ] Expired invite returns 400
- [ ] Revoked invite returns 400
- [ ] Reassignment creates history record

### Manual Verification
- [ ] Owner column visible only for PM
- [ ] Filter dropdowns work correctly
- [ ] URL updates with filter state
- [ ] Bookmarked filtered URL works
- [ ] Invite email arrives and link works
- [ ] Password validation on invite acceptance
- [ ] Weekly review navigation works
- [ ] Review exit shows session summary
- [ ] Client visible checkbox appears for PM only

## Estimated Effort

- **Complexity**: L (Large)
- **Estimated Effort**: 2-3 days
- **Risk Level**: Medium (email delivery, invitation flow)

## Implementation Notes

1. **Role Check Hook**: Create a reusable `useIsPM()` hook that checks the current user's role.

2. **Conditional Rendering**: Many components need PM-only sections. Consider a `<PMOnly>` wrapper component.

3. **Email Provider**: Use Supabase's built-in email or configure a provider (Resend, SendGrid).

4. **Invitation Token**: Use `crypto.randomUUID()` or similar for token generation.

5. **URL State Management**: Consider using nuqs or similar for URL state synchronization.

6. **Review Session State**: Store in localStorage or React state. Not persistent across sessions by design.

7. **Reassignment History**: Create a new table or use action_history pattern for tracking reassignments.

8. **Deactivated Users**: Deactivated users should not appear in owner dropdowns and cannot log in.

## Open Questions

- [ ] Should deactivated users' actions be reassigned or orphaned? (Recommendation: Keep assigned, hide from active filters)
- [ ] Email provider preference? (Recommendation: Start with Supabase, switch to Resend if needed)
- [ ] Should PM be able to promote another user to PM? (Recommendation: Yes, for backup purposes)
