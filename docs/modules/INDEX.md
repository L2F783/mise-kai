# Implementation Modules

## Overview

MiseKai Phase 1 is broken into **6 modules** that can be implemented semi-independently. The core MVP (M-01 through M-03) must ship together; remaining modules can be added incrementally.

## Dependency Graph

```
[M-01: Foundation & Auth]
         ↓
[M-02: Action CRUD] ←→ [M-03: Delay Management]
         ↓                      ↓
[M-04: PM Features] ←──────────┘
         ↓
[M-05: AI & Insights]
         ↓
[M-06: Export & Polish]
```

## Module Summary

| Module | Name | Complexity | Dependencies | Status |
|--------|------|------------|--------------|--------|
| M-01 | Foundation & Auth | L | None | Not Started |
| M-02 | Action CRUD | M | M-01 | Not Started |
| M-03 | Delay Management | M | M-01, M-02 | Not Started |
| M-04 | PM Features | L | M-01, M-02, M-03 | Not Started |
| M-05 | AI & Insights | L | M-04 | Not Started |
| M-06 | Export & Polish | S | M-02 | Not Started |

## MVP Scope

**Minimum Viable Product** (must ship together):
- M-01: Foundation & Auth
- M-02: Action CRUD
- M-03: Delay Management

**Enhanced MVP** (recommended for Week 1):
- M-04: PM Features (view all, assign, invite)

**Post-MVP** (can ship incrementally):
- M-05: AI & Insights (categorization, coaching insights, 5 Whys)
- M-06: Export & Polish (CSV export, UX refinements)

## Recommended Implementation Order

1. **M-01: Foundation & Auth** - Must complete first
   - Database schema, Supabase project, auth flows
   - ~2-3 days

2. **M-02: Action CRUD** - Core functionality
   - Create, read, update, delete actions
   - ~2 days

3. **M-03: Delay Management** - Closely coupled with CRUD
   - Status transitions, delay reasons, auto-flagging
   - ~1-2 days

4. **M-04: PM Features** - Enables team management
   - View all actions, assign, invite users, weekly review
   - ~2-3 days

5. **M-05: AI & Insights** - Can be done in parallel with M-06
   - Delay categorization, 5 Whys, coaching insights
   - ~3-4 days

6. **M-06: Export & Polish** - Can be done in parallel with M-05
   - CSV export, filtering, UX polish
   - ~1 day

## Parallel Execution Opportunities

These modules can be worked on simultaneously by different Claude sessions:

**After M-04 completes:**
- Session 1: `/plan-module M-05` (AI & Insights)
- Session 2: `/plan-module M-06` (Export & Polish)

**Within M-01 (if splitting further):**
- Session 1: Database schema + RLS policies
- Session 2: UI components + Auth flows

## User Stories by Module

### M-01: Foundation & Auth
- US-013: User Authenticates via Email/Password

### M-02: Action CRUD
- US-001: Team Member Views Personal Actions
- US-002: Team Member Creates Action

### M-03: Delay Management
- US-003: Team Member Updates Action Status
- US-004: System Auto-Flags Delayed Items

### M-04: PM Features
- US-005: PM Views All Actions
- US-006: PM Assigns Action to Team Member
- US-007: PM Invites Team Members
- US-008: PM Runs Weekly Review
- US-014: Action Marked Customer-Relevant

### M-05: AI & Insights
- US-009: PM Conducts 5 Whys Analysis
- US-010: System Categorizes Delay Reasons
- US-011: PM Views Coaching Insights

### M-06: Export & Polish
- US-012: User Exports Actions to CSV

## Functional Requirements by Module

### M-01
- FR-003: Row Level Security

### M-02
- FR-001: Action CRUD Operations
- FR-004: Filtering and Sorting

### M-03
- FR-002: Status Transition with Delay Reason

### M-04
- FR-001 (PM extensions)
- FR-004 (PM filters)

### M-05
- FR-005: 5 Whys Analysis Storage
- FR-006: AI Delay Categorization
- FR-007: Coaching Insights Aggregation

### M-06
- FR-008: CSV Export

## Getting Started

Start implementation with:
```
/plan-module M-01
```

Or to view a specific module:
```
cat docs/modules/M-01-foundation-auth.md
```
