# CLAUDE.md Template

Copy this to your project root and customize. This file is read at the start of every Claude Code session.

---

# Project: [Your Project Name]

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

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+
- **Framework**: [e.g., Next.js 14, Express, etc.]
- **Database**: [e.g., PostgreSQL, MongoDB, etc.]
- **ORM**: [e.g., Prisma, Drizzle, etc.]
- **Testing**: [e.g., Vitest, Jest, Playwright]
- **Styling**: [e.g., Tailwind CSS, CSS Modules]

## Project Structure

```
project/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components / routes
│   ├── api/            # API routes / handlers
│   ├── lib/            # Shared utilities
│   ├── types/          # TypeScript types
│   └── hooks/          # Custom React hooks
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── docs/
│   ├── PROJECT_CHARTER.md
│   ├── PRD.md
│   └── modules/
└── public/             # Static assets
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
- DO: Use React Query or SWR for data fetching
- REASON: Handles caching, loading, errors properly

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
DATABASE_URL=
API_SECRET=
NEXT_PUBLIC_API_URL=
```

## Git Workflow

- Branch naming: `feature/[ticket-id]-description`, `fix/[ticket-id]-description`
- Commit format: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- PR process: Create draft → Self-review → Request review → Merge

## Learnings from Code Review

<!-- Add rules discovered during PR reviews here -->
<!-- Format: DON'T / DO / REASON -->

---

*Last updated: [Date]*
*Maintained by: [Team/Person]*
