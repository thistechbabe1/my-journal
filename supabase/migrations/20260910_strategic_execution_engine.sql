-- Migration 20260910_strategic_execution_engine.sql
-- Operationalize Goals, Campaigns, Milestones, and Tasks into a unified Strategic Execution Engine

-- 1. Extend goals table
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'));

-- 2. Extend campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL;

-- 3. Extend goal_milestones table
ALTER TABLE goal_milestones
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_date DATE,
  ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES relationships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 4. Extend tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES goal_milestones(id) ON DELETE SET NULL;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_goals_life_area_id ON goals(life_area_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_goal_id ON campaigns(goal_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_life_area_id ON campaigns(life_area_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_campaign_id ON goal_milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_person_id ON goal_milestones(person_id);
CREATE INDEX IF NOT EXISTS idx_tasks_campaign_id ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
