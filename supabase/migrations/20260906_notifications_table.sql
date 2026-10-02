-- ==============================================================================
-- PHASE 2.4 MIGRATION: Notifications & Deduplication Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'person', 'event')),
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rationale TEXT[] DEFAULT '{}',
  tier TEXT NOT NULL CHECK (tier IN ('immediate', 'high', 'standard')),
  action_url TEXT NOT NULL,
  action_label TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Deduplication constraint: max 1 notification per entity condition per day
  CONSTRAINT unique_daily_notification UNIQUE (user_id, entity_type, entity_id, notification_date)
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_date ON notifications (user_id, notification_date DESC, is_read);
