-- Add index to randomizer_sessions table for faster querying by created_at
CREATE INDEX IF NOT EXISTS randomizer_sessions_created_at_idx ON randomizer_sessions (created_at DESC);
