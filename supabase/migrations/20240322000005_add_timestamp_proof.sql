-- Add timestamp_proof column to randomizer_sessions table
ALTER TABLE randomizer_sessions ADD COLUMN IF NOT EXISTS timestamp_proof TEXT;

-- Update existing records to have a timestamp_proof if they don't already
UPDATE randomizer_sessions SET timestamp_proof = created_at::TEXT WHERE timestamp_proof IS NULL;
