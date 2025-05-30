-- Create tables for the randomizer feature
CREATE TABLE IF NOT EXISTS randomizer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seed VARCHAR(255) NOT NULL,
  input_hash VARCHAR(255) NOT NULL,
  num_winners INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS randomizer_entrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES randomizer_sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS randomizer_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES randomizer_sessions(id) ON DELETE CASCADE,
  entrant_id UUID REFERENCES randomizer_entrants(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables are already part of the realtime publication