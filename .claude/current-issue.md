# Implementation: Issue #36

## Issue Details
**Title**: feat(M-03): Database schema for action dependencies and milestones
**Priority**: P1
**Labels**: enhancement, M-03, database, status:in-progress
**Branch**: `feature/issue-36-database-schema-gantt-dependencies-milestones`
**PR**: #47

## Status: ✅ Implementation Complete

## Acceptance Criteria
- [x] Create `milestones` table with RLS policies
- [x] Create `action_dependencies` junction table with RLS policies
- [x] Add new columns to `actions` table
- [x] Create indexes for performance (milestone_id, predecessor_id, successor_id)
- [x] Add check constraint: successor cannot equal predecessor
- [x] Add check constraint: no circular dependencies (deferred to application logic)

## Commits
1. `0689c29` - feat(db): add database schema for Gantt chart support (#36)
2. `5721add` - docs: add session learnings L-002 through L-004
3. `6602e09` - fix: resolve timezone issue in date validation

## Database Migrations
- `005_milestones_table.sql` - Milestones with RLS, indexes, triggers
- `006_action_dependencies_table.sql` - Dependencies with all 4 types, RLS, unique constraint
- `007_actions_gantt_columns.sql` - 6 new Gantt columns on actions

## TypeScript Types
- `Milestone`, `ActionDependency`, `DependencyType` in `src/types/database.ts`
- `GanttAction`, `MilestoneWithActions`, `ProjectWithMilestones` helper types

## Verification
- [x] TypeScript type check: ✅ Pass
- [x] ESLint: ✅ Pass
- [x] Unit tests: ✅ 62/62 Pass

## Next Steps
- PR #47 is open and awaiting CI re-run after timezone fix
- Once CI passes, ready for review and merge
