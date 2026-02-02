-- Projects Table for Gantt Chart and Milestone Grouping
-- Version: 1.0.0
-- Created: 2026-02-01
-- Issue: #36 - Database schema for action dependencies and milestones

-- =============================================================================
-- PROJECTS TABLE
-- Groups milestones and actions for project management views
-- =============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE,
  target_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'complete', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE projects IS 'Projects for grouping milestones and actions in Gantt views';
COMMENT ON COLUMN projects.name IS 'Project name (2-100 characters)';
COMMENT ON COLUMN projects.status IS 'Project status: active, on_hold, complete, or archived';
COMMENT ON COLUMN projects.target_end_date IS 'Target completion date for the project';

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_target_end_date ON projects(target_end_date);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects they own
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid());

-- PM can view all projects
CREATE POLICY "PM can view all projects"
  ON projects FOR SELECT
  USING (is_pm());

-- Users can create their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- PM can create projects for anyone
CREATE POLICY "PM can insert any project"
  ON projects FOR INSERT
  WITH CHECK (is_pm());

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());

-- PM can update any project
CREATE POLICY "PM can update any project"
  ON projects FOR UPDATE
  USING (is_pm());

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());

-- PM can delete any project
CREATE POLICY "PM can delete any project"
  ON projects FOR DELETE
  USING (is_pm());
