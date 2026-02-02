# Module M-01: Foundation & Auth

## Overview

Sets up the complete foundation for MiseKai: Supabase project configuration, database schema with all tables, Row Level Security policies, authentication flows (login, logout, password reset), and the base UI layout with navigation.

## Dependencies

### Required (must complete first)
- None - this is the foundation module

### Optional (nice to have)
- None

## Scope

### Files to Create
- `src/lib/supabase/client.ts` - Supabase client initialization
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/middleware.ts` - Auth middleware for protected routes
- `src/types/database.ts` - TypeScript types for database schema
- `src/types/index.ts` - Shared type definitions
- `src/app/layout.tsx` - Root layout with providers
- `src/app/page.tsx` - Landing/redirect page
- `src/app/login/page.tsx` - Login page
- `src/app/login/actions.ts` - Login server actions
- `src/app/auth/callback/route.ts` - Auth callback handler
- `src/app/forgot-password/page.tsx` - Password reset request
- `src/app/reset-password/page.tsx` - Password reset form
- `src/components/ui/` - Base UI components (Button, Input, Card, etc.)
- `src/components/layout/Header.tsx` - App header with user menu
- `src/components/layout/Sidebar.tsx` - Navigation sidebar (if needed)
- `src/components/providers/AuthProvider.tsx` - Auth context provider
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `supabase/migrations/002_rls_policies.sql` - RLS policies

### Files to Modify
- `.env.local` - Add Supabase credentials
- `package.json` - Add Supabase dependencies

### Out of Scope for This Module
- Action CRUD operations (M-02)
- Delay reason handling (M-03)
- PM-specific features (M-04)
- User invitation flow (M-04)

## Inputs

This module receives:
- Supabase project credentials (from Supabase dashboard)
- Environment configuration

## Outputs

This module produces:
- Configured Supabase client accessible throughout app
- Database schema ready for data
- Auth flows (login, logout, reset)
- Protected route middleware
- Base UI layout and components
- TypeScript types for all database entities

## Functional Requirements

From PRD, this module implements:
- FR-003: Row Level Security
- TR-002: Data Models (schema creation)
- TR-004: Security Requirements (auth, RLS, rate limiting)
- US-013: User Authenticates via Email/Password

## Technical Specifications

### Data Models

```sql
-- profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT CHECK (char_length(full_name) <= 100),
  role TEXT NOT NULL DEFAULT 'team_member' CHECK (role IN ('team_member', 'pm')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deactivated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- actions
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 500),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_target' CHECK (status IN ('on_target', 'delayed', 'complete')),
  notes TEXT CHECK (char_length(notes) <= 2000),
  client_visible BOOLEAN DEFAULT FALSE,
  auto_flagged BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- delay_reasons
CREATE TABLE delay_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10),
  category TEXT CHECK (category IN ('people', 'process', 'technical', 'capacity', 'external', 'other')),
  subcategory TEXT,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  ai_overridden BOOLEAN DEFAULT FALSE,
  manual_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- five_whys_analyses
CREATE TABLE five_whys_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  conducted_by UUID NOT NULL REFERENCES profiles(id),
  root_cause_identified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- five_whys_responses
CREATE TABLE five_whys_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES five_whys_analyses(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  response TEXT NOT NULL CHECK (char_length(response) BETWEEN 20 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- due_date_history
CREATE TABLE due_date_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  old_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Profiles: users can read own, PM can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "PM can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pm')
  );

-- Actions: team members see own, PM sees all
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON actions
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "PM can view all actions" ON actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pm')
  );

CREATE POLICY "Users can insert own actions" ON actions
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "PM can insert any action" ON actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pm')
  );

CREATE POLICY "Users can update own actions" ON actions
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "PM can update any action" ON actions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pm')
  );

-- Similar policies for delay_reasons, five_whys, etc.
```

### Auth Configuration

```typescript
// Supabase Auth settings
{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
}
```

## Acceptance Criteria

All must pass for module completion:

- [ ] Supabase project created and configured
- [ ] All database tables created with correct constraints
- [ ] RLS policies enforce data isolation correctly
- [ ] Login flow works (email + password)
- [ ] Logout clears session and redirects
- [ ] Password reset flow sends email and allows reset
- [ ] Protected routes redirect to login if unauthenticated
- [ ] Session persists across page refreshes (7 days)
- [ ] Rate limiting active (5 failed attempts = 15min lockout)
- [ ] Password validation enforced (8+ chars, 1 number, 1 special)
- [ ] Base UI layout renders correctly
- [ ] TypeScript types generated and exported
- [ ] All unit tests pass
- [ ] Integration tests with Supabase pass

## Verification

### Unit Tests Required
- [ ] Supabase client initializes correctly
- [ ] Auth middleware redirects unauthenticated users
- [ ] Password validation function works correctly
- [ ] TypeScript types match database schema

### Integration Tests Required
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails with correct error
- [ ] Session refresh works
- [ ] RLS policies block unauthorized access
- [ ] Password reset email sends

### Manual Verification
- [ ] Login page renders correctly
- [ ] Error messages display on failed login
- [ ] Logout button works
- [ ] Password reset flow completes end-to-end
- [ ] Browser dev tools show JWT token stored correctly

## Estimated Effort

- **Complexity**: L (Large)
- **Estimated Effort**: 2-3 days
- **Risk Level**: Medium (Supabase setup can have gotchas)

## Implementation Notes

1. **Create Supabase Project First**: Before writing any code, create the Supabase project and run migrations.

2. **Use Supabase CLI**: Prefer `supabase` CLI for migrations to ensure reproducibility.

3. **TypeScript Generation**: Use `supabase gen types typescript` to generate types from schema.

4. **Auth Callbacks**: The `/auth/callback` route is critical for magic links and OAuth flows.

5. **Middleware Order**: Auth middleware must run before any protected route handlers.

6. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

7. **First User Setup**: After schema creation, manually insert the first PM user or create a seed script.

## Open Questions

- [ ] Should we use Supabase's built-in auth UI or custom components? (Recommendation: custom for better UX control)
- [ ] Do we need social auth (Google, GitHub) for Phase 1? (PRD says no, email/password only)
