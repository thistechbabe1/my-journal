-- Migration 20260911_seasons_identity_execution.sql
-- Phase 3.2: Seasons & Identity Execution Layer

-- 1. Extend goals table with season linkage and explicit identity alignment (values & principles)
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS core_values TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS life_principles TEXT[] DEFAULT '{}';

-- 2. Extend daily_check_ins table with per-day non-negotiables protection tracking
ALTER TABLE daily_check_ins
  ADD COLUMN IF NOT EXISTS non_negotiables_completed TEXT[] DEFAULT '{}';

-- 3. Enforce single active season constraint per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_season ON seasons(user_id) WHERE status = 'active';

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_goals_season_id ON goals(season_id);
CREATE INDEX IF NOT EXISTS idx_seasons_user_status ON seasons(user_id, status);
