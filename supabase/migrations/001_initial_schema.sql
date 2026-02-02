-- MiseKai Initial Schema
-- Version: 1.0.0
-- Created: 2026-02-01

-- =============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with application-specific data
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT CHECK (char_length(full_name) <= 100),
  role TEXT NOT NULL DEFAULT 'team_member' CHECK (role IN ('team_member', 'pm')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deactivated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.role IS 'User role: team_member (default) or pm (project manager)';
COMMENT ON COLUMN profiles.status IS 'Account status: active, pending (invited), or deactivated';

-- =============================================================================
-- ACTIONS TABLE
-- Core task/action items that team members work on
-- =============================================================================
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

COMMENT ON TABLE actions IS 'Core action items/tasks for team members';
COMMENT ON COLUMN actions.status IS 'Action status: on_target, delayed, or complete';
COMMENT ON COLUMN actions.auto_flagged IS 'True if system auto-flagged as delayed (past due date)';
COMMENT ON COLUMN actions.client_visible IS 'True if action should appear in client-facing views';

-- =============================================================================
-- DELAY REASONS TABLE
-- Explanations for why actions are delayed
-- =============================================================================
CREATE TABLE delay_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10),
  category TEXT CHECK (category IN ('people', 'process', 'technical', 'capacity', 'external', 'other')),
  subcategory TEXT,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  ai_overridden BOOLEAN DEFAULT FALSE,
  manual_category TEXT CHECK (manual_category IN ('people', 'process', 'technical', 'capacity', 'external', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

COMMENT ON TABLE delay_reasons IS 'Explanations for delayed actions, with AI categorization';
COMMENT ON COLUMN delay_reasons.category IS 'AI-assigned category for the delay reason';
COMMENT ON COLUMN delay_reasons.confidence IS 'AI confidence score (0-1) for the category assignment';
COMMENT ON COLUMN delay_reasons.ai_overridden IS 'True if PM manually overrode the AI category';
COMMENT ON COLUMN delay_reasons.manual_category IS 'PM-assigned category when AI was overridden';

-- =============================================================================
-- FIVE WHYS ANALYSES TABLE
-- Root cause analysis records
-- =============================================================================
CREATE TABLE five_whys_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  conducted_by UUID NOT NULL REFERENCES profiles(id),
  root_cause_identified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE five_whys_analyses IS '5 Whys root cause analysis sessions for delayed actions';

-- =============================================================================
-- FIVE WHYS RESPONSES TABLE
-- Individual responses in a 5 Whys analysis (1-5 levels)
-- =============================================================================
CREATE TABLE five_whys_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES five_whys_analyses(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  response TEXT NOT NULL CHECK (char_length(response) BETWEEN 20 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(analysis_id, level)
);

COMMENT ON TABLE five_whys_responses IS 'Individual responses at each level of a 5 Whys analysis';
COMMENT ON COLUMN five_whys_responses.level IS 'Which "why" this is (1-5)';

-- =============================================================================
-- DUE DATE HISTORY TABLE
-- Audit trail for due date changes
-- =============================================================================
CREATE TABLE due_date_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  old_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE due_date_history IS 'Audit trail of due date changes for actions';

-- =============================================================================
-- INVITATIONS TABLE
-- Pending user invitations from PM
-- =============================================================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE invitations IS 'Pending user invitations to join the system';
COMMENT ON COLUMN invitations.token IS 'Unique token for the invitation link';
COMMENT ON COLUMN invitations.expires_at IS 'When the invitation expires (7 days from creation)';

-- =============================================================================
-- INDEXES
-- Performance optimization for common queries
-- =============================================================================
CREATE INDEX idx_actions_owner_id ON actions(owner_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_due_date ON actions(due_date);
CREATE INDEX idx_actions_owner_status ON actions(owner_id, status);
CREATE INDEX idx_actions_created_at ON actions(created_at DESC);

CREATE INDEX idx_delay_reasons_action_id ON delay_reasons(action_id);
CREATE INDEX idx_delay_reasons_category ON delay_reasons(category);
CREATE INDEX idx_delay_reasons_created_at ON delay_reasons(created_at DESC);

CREATE INDEX idx_five_whys_analyses_action_id ON five_whys_analyses(action_id);
CREATE INDEX idx_five_whys_responses_analysis_id ON five_whys_responses(analysis_id);

CREATE INDEX idx_due_date_history_action_id ON due_date_history(action_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- =============================================================================
-- TRIGGERS
-- Auto-update timestamps
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for actions
CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PROFILE CREATION TRIGGER
-- Auto-create profile when user signs up
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team_member'),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
