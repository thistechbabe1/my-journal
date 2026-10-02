-- Migration 20260912_memoirs_lifelong_archives.sql
-- Phase 3.3: Memoirs & Lifelong Archives Performance Indexes

-- Indexes for fast cross-year chronological aggregation and filtering
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_period ON reviews(user_id, period_type, period_key);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_seasons_user_status_dates ON seasons(user_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_user_date ON daily_check_ins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_date ON timeline_events(user_id, date DESC);
