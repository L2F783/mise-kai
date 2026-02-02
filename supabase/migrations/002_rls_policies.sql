-- MiseKai Row Level Security Policies
-- Version: 1.0.0
-- Created: 2026-02-01

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Check if current user is a PM
CREATE OR REPLACE FUNCTION is_pm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'pm'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_pm() IS 'Returns true if the current authenticated user has the PM role';

-- =============================================================================
-- PROFILES RLS
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- PM can view all profiles
CREATE POLICY "PM can view all profiles"
  ON profiles FOR SELECT
  USING (is_pm());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Users cannot change their own role or status
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

-- PM can update any profile
CREATE POLICY "PM can update any profile"
  ON profiles FOR UPDATE
  USING (is_pm());

-- =============================================================================
-- ACTIONS RLS
-- =============================================================================
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Users can view their own actions
CREATE POLICY "Users can view own actions"
  ON actions FOR SELECT
  USING (owner_id = auth.uid());

-- PM can view all actions
CREATE POLICY "PM can view all actions"
  ON actions FOR SELECT
  USING (is_pm());

-- Users can create their own actions
CREATE POLICY "Users can insert own actions"
  ON actions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- PM can create actions for anyone
CREATE POLICY "PM can insert any action"
  ON actions FOR INSERT
  WITH CHECK (is_pm());

-- Users can update their own actions
CREATE POLICY "Users can update own actions"
  ON actions FOR UPDATE
  USING (owner_id = auth.uid());

-- PM can update any action
CREATE POLICY "PM can update any action"
  ON actions FOR UPDATE
  USING (is_pm());

-- Users can delete their own actions (soft delete enforced at app layer)
CREATE POLICY "Users can delete own actions"
  ON actions FOR DELETE
  USING (owner_id = auth.uid());

-- PM can delete any action
CREATE POLICY "PM can delete any action"
  ON actions FOR DELETE
  USING (is_pm());

-- =============================================================================
-- DELAY REASONS RLS
-- =============================================================================
ALTER TABLE delay_reasons ENABLE ROW LEVEL SECURITY;

-- Users can view delay reasons for their own actions
CREATE POLICY "Users can view own action delay reasons"
  ON delay_reasons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actions
      WHERE actions.id = delay_reasons.action_id
      AND actions.owner_id = auth.uid()
    )
  );

-- PM can view all delay reasons
CREATE POLICY "PM can view all delay reasons"
  ON delay_reasons FOR SELECT
  USING (is_pm());

-- Users can create delay reasons for their own actions
CREATE POLICY "Users can insert delay reasons for own actions"
  ON delay_reasons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions
      WHERE actions.id = action_id
      AND actions.owner_id = auth.uid()
    )
  );

-- PM can create delay reasons for any action
CREATE POLICY "PM can insert any delay reason"
  ON delay_reasons FOR INSERT
  WITH CHECK (is_pm());

-- Users can update delay reasons they created
CREATE POLICY "Users can update own delay reasons"
  ON delay_reasons FOR UPDATE
  USING (created_by = auth.uid());

-- PM can update any delay reason (for category overrides)
CREATE POLICY "PM can update any delay reason"
  ON delay_reasons FOR UPDATE
  USING (is_pm());

-- =============================================================================
-- FIVE WHYS ANALYSES RLS
-- =============================================================================
ALTER TABLE five_whys_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view analyses for their own actions
CREATE POLICY "Users can view own action analyses"
  ON five_whys_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actions
      WHERE actions.id = five_whys_analyses.action_id
      AND actions.owner_id = auth.uid()
    )
  );

-- PM can view all analyses
CREATE POLICY "PM can view all analyses"
  ON five_whys_analyses FOR SELECT
  USING (is_pm());

-- Only PM can create analyses (5 Whys is a PM coaching activity)
CREATE POLICY "PM can insert analyses"
  ON five_whys_analyses FOR INSERT
  WITH CHECK (is_pm());

-- Only PM can update analyses
CREATE POLICY "PM can update analyses"
  ON five_whys_analyses FOR UPDATE
  USING (is_pm());

-- =============================================================================
-- FIVE WHYS RESPONSES RLS
-- =============================================================================
ALTER TABLE five_whys_responses ENABLE ROW LEVEL SECURITY;

-- Users can view responses for analyses on their own actions
CREATE POLICY "Users can view own action analysis responses"
  ON five_whys_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM five_whys_analyses fwa
      JOIN actions a ON a.id = fwa.action_id
      WHERE fwa.id = five_whys_responses.analysis_id
      AND a.owner_id = auth.uid()
    )
  );

-- PM can view all responses
CREATE POLICY "PM can view all responses"
  ON five_whys_responses FOR SELECT
  USING (is_pm());

-- Only PM can create responses
CREATE POLICY "PM can insert responses"
  ON five_whys_responses FOR INSERT
  WITH CHECK (is_pm());

-- Only PM can update responses
CREATE POLICY "PM can update responses"
  ON five_whys_responses FOR UPDATE
  USING (is_pm());

-- =============================================================================
-- DUE DATE HISTORY RLS
-- =============================================================================
ALTER TABLE due_date_history ENABLE ROW LEVEL SECURITY;

-- Users can view history for their own actions
CREATE POLICY "Users can view own action due date history"
  ON due_date_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actions
      WHERE actions.id = due_date_history.action_id
      AND actions.owner_id = auth.uid()
    )
  );

-- PM can view all history
CREATE POLICY "PM can view all due date history"
  ON due_date_history FOR SELECT
  USING (is_pm());

-- Users can create history entries for their own actions
CREATE POLICY "Users can insert due date history for own actions"
  ON due_date_history FOR INSERT
  WITH CHECK (
    changed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM actions
      WHERE actions.id = action_id
      AND actions.owner_id = auth.uid()
    )
  );

-- PM can create history entries for any action
CREATE POLICY "PM can insert any due date history"
  ON due_date_history FOR INSERT
  WITH CHECK (is_pm());

-- =============================================================================
-- INVITATIONS RLS
-- =============================================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only PM can view invitations
CREATE POLICY "PM can view all invitations"
  ON invitations FOR SELECT
  USING (is_pm());

-- Only PM can create invitations
CREATE POLICY "PM can insert invitations"
  ON invitations FOR INSERT
  WITH CHECK (is_pm());

-- Only PM can update invitations (for marking as accepted)
CREATE POLICY "PM can update invitations"
  ON invitations FOR UPDATE
  USING (is_pm());

-- Only PM can delete invitations (for revoking)
CREATE POLICY "PM can delete invitations"
  ON invitations FOR DELETE
  USING (is_pm());
