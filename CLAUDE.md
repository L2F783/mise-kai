# Project: MiseKai

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build
```

## Tech Stack

> For detailed technology comparisons and justifications, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (GoTrue)
- **ORM**: Supabase Client SDK
- **Validation**: Zod
- **Data Fetching**: TanStack Query
- **UI Components**: shadcn/ui (Radix primitives)
- **Testing**: Vitest, Playwright
- **Styling**: Tailwind CSS v4
- **AI**: Claude API (delay categorization, insights)
- **Hosting**: Vercel

## Architectural Decisions

> Full technology comparisons with alternatives are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### ADR-001: Supabase for Database & Auth (2026-02-01)

**Status**: Accepted

**Context**: Need database and auth infrastructure. Future plans may include AWS migration.

**Decision**: Use Supabase (Option A - use now, migrate later if needed)

**Rationale**:
- Faster initial development
- PostgreSQL underneath = database layer is portable
- RLS policies are native PostgreSQL (no lock-in)
- Auth is the primary lock-in point, but migration is feasible

**Lock-in Assessment**:
| Component | Portability | Migration Path |
|-----------|-------------|----------------|
| PostgreSQL DB | 100% portable | Direct export to RDS |
| SQL Migrations | 100% portable | Standard SQL |
| RLS Policies | 100% portable | Native PostgreSQL |
| Supabase Auth | Requires migration | → AWS Cognito or Auth0 |
| Supabase Client | Requires replacement | → Prisma/Drizzle |

**Consequences**:
- Accept auth migration effort if moving to AWS
- Keep auth logic in dedicated modules for easier future extraction
- Document all Supabase-specific code patterns

## Project Structure

```
project/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/v1/       # Versioned API routes
│   │   ├── auth/         # Auth pages (login, forgot-password, etc.)
│   │   └── dashboard/    # Protected dashboard pages
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Header, etc.)
│   │   ├── providers/    # Context providers
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Shared utilities
│   │   ├── supabase/     # Supabase client configuration
│   │   └── validations/  # Zod validation schemas
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # SQL migration files
├── tests/
│   ├── unit/             # Unit tests (Vitest)
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests (Playwright)
├── docs/
│   ├── PROJECT_CHARTER.md
│   ├── PRD.md
│   └── modules/          # Module implementation specs
└── public/               # Static assets
```

## Code Conventions

### Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: SCREAMING_SNAKE (`MAX_RETRIES`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Types/Interfaces**: PascalCase with prefix (`IUser`, `TUserProps`)

### Component Structure

```typescript
// 1. Imports (external, then internal, then styles)
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Export
```

### Error Handling

```typescript
// Always handle errors explicitly
try {
  const result = await riskyOperation();
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  }
  // Log and rethrow or handle gracefully
  logger.error('Operation failed', { error });
  throw error;
}
```

## Non-Negotiables

- [ ] **All code must have tests** - No PR without test coverage
- [ ] **No any types** - Use proper TypeScript types
- [ ] **No console.log in production** - Use proper logging
- [ ] **No hardcoded secrets** - Use environment variables
- [ ] **Always handle loading/error states** - UI must be resilient
- [ ] **Run lint before commit** - No lint errors in PRs

## Common Mistakes to Avoid

### Database

- DON'T: Write raw SQL queries
- DO: Use the ORM with parameterized queries
- REASON: SQL injection prevention

### API Calls

- DON'T: Fetch in useEffect without cleanup
- DO: Use TanStack Query for data fetching
- REASON: Handles caching, loading, errors, optimistic updates

### State Management

- DON'T: Prop drill more than 2 levels
- DO: Use context or state management for deep state
- REASON: Maintainability

### Components

- DON'T: Put business logic in components
- DO: Extract to hooks or utility functions
- REASON: Testability and reusability

### Testing

- DON'T: Test implementation details
- DO: Test behavior and user interactions
- REASON: Tests shouldn't break on refactors

## API Patterns

### Request Handlers

```typescript
// Standard API handler structure
export async function handler(req: Request) {
  // 1. Validate input
  // 2. Authenticate/authorize
  // 3. Execute business logic
  // 4. Return formatted response
}
```

### Response Format

```typescript
// Success
{ data: T, meta?: { pagination, etc } }

// Error
{ error: { code: string, message: string, details?: any } }
```

## Environment Variables

Required variables (see `.env.example`):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# AI (for delay categorization)
ANTHROPIC_API_KEY=
```

## Git Workflow

- Branch naming: `feature/[ticket-id]-description`, `fix/[ticket-id]-description`
- Commit format: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- PR process: Create draft → Self-review → Request review → Merge

## Learnings from Code Review

See [docs/lessons.md](docs/lessons.md) for detailed lessons learned.

### L-001: Verify Folder Structure Before Implementation (2026-02-01)
- DON'T: Assume scaffolding tools create the correct structure
- DO: Verify folder structure matches CLAUDE.md before writing code
- REASON: Restructuring after implementation wastes time and risks conflicts

### L-002: Zod Strips Undefined Schema Fields (2026-02-02)
- DON'T: Use create schema for edit forms needing extra fields
- DO: Create edit schema extending create schema
- REASON: zodResolver strips fields not in schema

### L-003: React Query Infinite Query Invalidation (2026-02-02)
- DON'T: Use `invalidateQueries({ queryKey: actionsKeys.lists() })`
- DO: Use `{ queryKey: actionsKeys.all, refetchType: 'all' }`
- REASON: Ensures infinite scroll queries refresh

### L-004: Database Constraints vs TypeScript (2026-02-02)
- DON'T: Assume TS compilation = DB accepts values
- DO: Verify DB CHECK constraints match TS types
- REASON: Runtime errors when DB rejects valid TS values

---

*Last updated: 2026-02-02* (Added session learnings L-002 through L-004)
