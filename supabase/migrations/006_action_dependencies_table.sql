-- Action Dependencies Table for Gantt Chart Scheduling
-- Version: 1.0.0
-- Created: 2026-02-01
-- Issue: #36 - Database schema for action dependencies and milestones

-- =============================================================================
-- ACTION DEPENDENCIES TABLE
-- Junction table for action-to-action dependencies in Gantt scheduling
--
-- Dependency types:
-- - finish_to_start: predecessor must finish before successor starts (default, most common)
-- - start_to_start: both actions start together
-- - finish_to_finish: both actions finish together
-- - start_to_finish: predecessor start enables successor finish (rare)
-- =============================================================================
CREATE TABLE action_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start'
    CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate dependencies between same actions
  UNIQUE(predecessor_id, successor_id),

  -- Prevent self-referencing dependencies
  CHECK (predecessor_id != successor_id)
);

COMMENT ON TABLE action_dependencies IS 'Dependencies between actions for Gantt chart scheduling';
COMMENT ON COLUMN action_dependencies.predecessor_id IS 'The action that must complete/start first';
COMMENT ON COLUMN action_dependencies.successor_id IS 'The action that depends on the predecessor';
COMMENT ON COLUMN action_dependencies.dependency_type IS 'Type of dependency relationship';
COMMENT ON COLUMN action_dependencies.lag_days IS 'Optional delay in days between predecessor and successor';

-- =============================================================================
-- INDEXES
-- Optimized for traversing the dependency graph in both directions
-- =============================================================================
CREATE INDEX idx_action_dependencies_predecessor ON action_dependencies(predecessor_id);
CREATE INDEX idx_action_dependencies_successor ON action_dependencies(successor_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Users can view/manage dependencies for actions they own or are PM
-- =============================================================================
ALTER TABLE action_dependencies ENABLE ROW LEVEL SECURITY;

-- Users can view dependencies where they own either action
CREATE POLICY "Users can view dependencies for own actions"
  ON action_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.predecessor_id
      AND a.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.successor_id
      AND a.owner_id = auth.uid()
    )
  );

-- PM can view all dependencies
CREATE POLICY "PM can view all dependencies"
  ON action_dependencies FOR SELECT
  USING (is_pm());

-- Users can create dependencies between their own actions
CREATE POLICY "Users can insert dependencies for own actions"
  ON action_dependencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = predecessor_id
      AND a.owner_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = successor_id
      AND a.owner_id = auth.uid()
    )
  );

-- PM can create dependencies between any actions
CREATE POLICY "PM can insert any dependency"
  ON action_dependencies FOR INSERT
  WITH CHECK (is_pm());

-- Users can update dependencies they created (limited to lag_days adjustment)
CREATE POLICY "Users can update dependencies for own actions"
  ON action_dependencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.predecessor_id
      AND a.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.successor_id
      AND a.owner_id = auth.uid()
    )
  );

-- PM can update any dependency
CREATE POLICY "PM can update any dependency"
  ON action_dependencies FOR UPDATE
  USING (is_pm());

-- Users can delete dependencies where they own either action
CREATE POLICY "Users can delete dependencies for own actions"
  ON action_dependencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.predecessor_id
      AND a.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_dependencies.successor_id
      AND a.owner_id = auth.uid()
    )
  );

-- PM can delete any dependency
CREATE POLICY "PM can delete any dependency"
  ON action_dependencies FOR DELETE
  USING (is_pm());
