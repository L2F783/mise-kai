-- Milestones Table for Project Timeline Markers
-- Version: 1.0.0
-- Created: 2026-02-01
-- Issue: #36 - Database schema for action dependencies and milestones

-- =============================================================================
-- MILESTONES TABLE
-- Timeline markers within projects for Gantt chart visualization
-- =============================================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  target_date DATE NOT NULL,
  description TEXT CHECK (char_length(description) <= 500),
  color TEXT DEFAULT '#1D76DB' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE milestones IS 'Project milestones for Gantt chart timeline markers';
COMMENT ON COLUMN milestones.name IS 'Milestone name (2-100 characters)';
COMMENT ON COLUMN milestones.target_date IS 'Target date for milestone completion';
COMMENT ON COLUMN milestones.color IS 'Hex color code for Gantt chart display (e.g., #1D76DB)';

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- Milestones inherit access from parent project
-- =============================================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Users can view milestones for projects they own
CREATE POLICY "Users can view milestones for own projects"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = milestones.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- PM can view all milestones
CREATE POLICY "PM can view all milestones"
  ON milestones FOR SELECT
  USING (is_pm());

-- Users can create milestones in their own projects
CREATE POLICY "Users can insert milestones in own projects"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND p.owner_id = auth.uid()
    )
  );

-- PM can create milestones in any project
CREATE POLICY "PM can insert any milestone"
  ON milestones FOR INSERT
  WITH CHECK (is_pm());

-- Users can update milestones in their own projects
CREATE POLICY "Users can update milestones in own projects"
  ON milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = milestones.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- PM can update any milestone
CREATE POLICY "PM can update any milestone"
  ON milestones FOR UPDATE
  USING (is_pm());

-- Users can delete milestones in their own projects
CREATE POLICY "Users can delete milestones in own projects"
  ON milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = milestones.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- PM can delete any milestone
CREATE POLICY "PM can delete any milestone"
  ON milestones FOR DELETE
  USING (is_pm());
