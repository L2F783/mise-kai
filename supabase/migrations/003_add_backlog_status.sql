-- Add 'backlog' to the actions status check constraint
-- This allows actions to be placed in a backlog state for later work
-- Version: 1.0.1
-- Created: 2026-02-01

-- Drop the existing constraint and recreate with backlog included
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_status_check;

ALTER TABLE actions ADD CONSTRAINT actions_status_check
  CHECK (status IN ('on_target', 'delayed', 'complete', 'backlog'));

COMMENT ON COLUMN actions.status IS 'Action status: on_target, delayed, complete, or backlog';
