-- Extend existing relationships table for People & Follow-ups System
ALTER TABLE relationships
  DROP CONSTRAINT IF EXISTS relationships_type_check;

ALTER TABLE relationships
  ADD COLUMN IF NOT EXISTS context TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS waiting_on TEXT,
  ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add status check constraint if needed
ALTER TABLE relationships
  DROP CONSTRAINT IF EXISTS relationships_status_check;

ALTER TABLE relationships
  ADD CONSTRAINT relationships_status_check CHECK (status IN ('active', 'waiting', 'archived'));

-- Create relationship_interactions table for interaction history timeline
CREATE TABLE IF NOT EXISTS relationship_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT DEFAULT 'Note', -- e.g. WhatsApp, Call, Email, Meeting, Note
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for relationship_interactions
ALTER TABLE relationship_interactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'relationship_interactions' AND policyname = 'Users can manage their own relationship interactions'
  ) THEN
    CREATE POLICY "Users can manage their own relationship interactions"
      ON relationship_interactions
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_relationship_interactions_rel_id ON relationship_interactions(relationship_id, interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_followup ON relationships(next_follow_up_date) WHERE status != 'archived';
