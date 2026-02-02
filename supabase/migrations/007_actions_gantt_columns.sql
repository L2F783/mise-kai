-- Add Gantt-Related Columns to Actions Table
-- Version: 1.0.0
-- Created: 2026-02-01
-- Issue: #36 - Database schema for action dependencies and milestones

-- =============================================================================
-- NEW COLUMNS FOR GANTT CHART SUPPORT
-- =============================================================================

-- Start date for Gantt bar positioning (distinct from due_date which is end date)
ALTER TABLE actions ADD COLUMN start_date DATE;

COMMENT ON COLUMN actions.start_date IS 'Start date for Gantt bar positioning';

-- Estimated duration in days (alternative to explicit start_date)
ALTER TABLE actions ADD COLUMN estimated_duration_days INTEGER
  CHECK (estimated_duration_days IS NULL OR estimated_duration_days > 0);

COMMENT ON COLUMN actions.estimated_duration_days IS 'Estimated work duration in days';

-- Link action to a milestone for grouping in Gantt views
ALTER TABLE actions ADD COLUMN milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;

COMMENT ON COLUMN actions.milestone_id IS 'Optional milestone this action contributes to';

-- Manual critical path flag for visual emphasis
ALTER TABLE actions ADD COLUMN is_critical BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN actions.is_critical IS 'True if action is on the critical path';

-- Actual dates for tracking vs planned (used for variance analysis)
ALTER TABLE actions ADD COLUMN actual_start_date DATE;
ALTER TABLE actions ADD COLUMN actual_end_date DATE;

COMMENT ON COLUMN actions.actual_start_date IS 'Actual date work began (for variance tracking)';
COMMENT ON COLUMN actions.actual_end_date IS 'Actual date work completed (for variance tracking)';

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_actions_milestone_id ON actions(milestone_id);
CREATE INDEX idx_actions_start_date ON actions(start_date);
CREATE INDEX idx_actions_is_critical ON actions(is_critical) WHERE is_critical = true;
