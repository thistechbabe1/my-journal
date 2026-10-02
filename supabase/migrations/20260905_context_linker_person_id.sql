-- Add optional person_id foreign key to tasks and events for multi-dimensional context
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES relationships(id) ON DELETE SET NULL;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES relationships(id) ON DELETE SET NULL;

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_tasks_person_id ON tasks(person_id);
CREATE INDEX IF NOT EXISTS idx_events_person_id ON events(person_id);
