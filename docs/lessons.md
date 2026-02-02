# Lessons Learned

## 2026-02-01: Folder Structure Must Match CLAUDE.md

### Issue
During M-01 implementation, the Next.js Supabase template was used which created files at the root level (`/app`, `/components`, `/lib`) instead of under `/src` as specified in CLAUDE.md. The API versioning (`/api/v1`) was also missing.

### Root Cause
- Used `create-next-app` template without verifying its output structure against project conventions
- Did not cross-reference CLAUDE.md project structure before starting implementation
- Assumed template defaults would match project requirements

### Impact
- Required restructuring after implementation was complete
- Had to update multiple config files (tsconfig.json, tailwind.config.ts, vitest.config.ts, components.json)
- Risk of merge conflicts if other work had started in parallel

### Correction
Before starting any implementation phase:

1. **Read CLAUDE.md first** - Verify the expected project structure before writing any code
2. **Validate template output** - When using scaffolding tools (create-next-app, etc.), immediately verify the generated structure matches expectations
3. **Create structure first** - Before writing code, create the folder structure explicitly:
   ```bash
   mkdir -p src/app/api/v1
   mkdir -p src/components/{layout,providers,ui}
   mkdir -p src/hooks
   mkdir -p src/lib
   mkdir -p src/types
   ```
4. **Update configs early** - If using a template, update path aliases in config files immediately after scaffolding

### Checklist for Future Implementations

Before starting implementation:
- [ ] Read CLAUDE.md project structure section
- [ ] Verify folder structure matches conventions
- [ ] Check path aliases in tsconfig.json (`@/*` → `./src/*`)
- [ ] Check content paths in tailwind.config.ts
- [ ] Verify API routes use versioning (`/api/v1/`)
- [ ] Confirm test config aliases match

### Prevention
Add this check to the implementation workflow:

```markdown
## Pre-Implementation Checklist
- [ ] Folder structure matches CLAUDE.md
- [ ] API routes versioned as /api/v1
- [ ] Path aliases configured correctly
```

---

## 2026-02-02: Zod Strips Undefined Schema Fields

### Issue
When using `zodResolver` with React Hook Form, fields not defined in the Zod schema are silently stripped from the form data before submission. This caused issues when reusing a "create" schema for "edit" forms that needed additional fields like `id`.

### Root Cause
- Zod's `.parse()` method (used by zodResolver) strips unknown fields by default
- A create schema (e.g., `createActionSchema`) doesn't include `id`
- When the edit form submitted, the `id` was stripped, causing the update to fail

### Impact
- Edit operations failed silently or with confusing errors
- Extra debugging time to discover the root cause

### Correction
Create separate schemas for create vs edit operations:

```typescript
// Base schema for creation
export const createActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  // ... other fields
});

// Extended schema for editing (includes id)
export const editActionSchema = createActionSchema.extend({
  id: z.string().uuid(),
});
```

### Prevention
- Always check if forms need different schemas for create vs edit
- Consider using `.passthrough()` if unknown fields should be preserved
- Test form submissions with all expected fields

---

## 2026-02-02: React Query Infinite Query Invalidation

### Issue
After creating or updating an action, calling `invalidateQueries({ queryKey: actionsKeys.lists() })` did not refresh the infinite scroll list, causing stale data to be displayed.

### Root Cause
- Infinite queries have a different internal structure than regular queries
- The standard `invalidateQueries` call wasn't properly targeting the infinite query
- React Query needs explicit `refetchType: 'all'` to refetch all pages of an infinite query

### Impact
- Users had to manually refresh the page to see their changes
- Poor UX after CRUD operations

### Correction
Use the broader query key with explicit refetch type:

```typescript
// DON'T
queryClient.invalidateQueries({ queryKey: actionsKeys.lists() });

// DO
queryClient.invalidateQueries({
  queryKey: actionsKeys.all,
  refetchType: 'all'
});
```

### Prevention
- When using infinite queries, always test cache invalidation behavior
- Use `refetchType: 'all'` for infinite queries to ensure all pages refresh
- Consider setting this as a default pattern in the codebase

---

## 2026-02-02: Database Constraints vs TypeScript

### Issue
TypeScript accepted enum values that the database rejected. The `status` field had a CHECK constraint allowing only specific values, but TypeScript's type system allowed values that passed compilation but failed at runtime.

### Root Cause
- TypeScript types and database CHECK constraints are independent systems
- Adding a new status value to TypeScript doesn't update the database constraint
- Migration 007 added `backlog` to the CHECK constraint but was applied after the type was updated

### Impact
- Runtime errors when inserting records with valid TypeScript values
- Confusing error messages from the database layer

### Correction
Always update both TypeScript types AND database constraints together:

```typescript
// TypeScript enum/type
export type ActionStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'backlog';

// Must match database migration
ALTER TABLE actions DROP CONSTRAINT actions_status_check;
ALTER TABLE actions ADD CONSTRAINT actions_status_check
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'backlog'));
```

### Prevention
- When adding enum values, always create a migration first
- Run migrations before testing new enum values
- Consider using a single source of truth (generate types from DB schema)

---

## 2026-02-02: Timezone-Safe Date Comparisons

### Issue
Date validation that compared dates using JavaScript `Date` objects failed intermittently. A check that `start_date <= end_date` sometimes rejected valid inputs where both dates were the same day.

### Root Cause
- `new Date("2026-02-02")` creates a Date at UTC midnight (00:00:00 UTC)
- `new Date()` creates a Date in local timezone
- When comparing, the UTC midnight date could be "earlier" than expected due to timezone offset
- Date-only comparisons were being done with full datetime precision

### Impact
- Validation errors that were hard to reproduce
- Date constraints failing unexpectedly based on user's timezone

### Correction
For date-only comparisons, compare strings directly:

```typescript
// DON'T - timezone issues
const start = new Date(startDate);
const end = new Date(endDate);
if (start > end) throw new Error("Invalid dates");

// DO - string comparison for YYYY-MM-DD format
if (startDate > endDate) throw new Error("Invalid dates");
// String comparison works because YYYY-MM-DD sorts lexicographically
```

### Prevention
- Use string comparison for date-only values (YYYY-MM-DD format)
- If using Date objects, normalize to the same timezone first
- Consider using a date library (date-fns, dayjs) for complex date operations
- Always test date edge cases across different timezones
