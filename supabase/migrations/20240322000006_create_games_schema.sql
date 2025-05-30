CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'intermediate',
  thumbnail_url TEXT,
  max_players INTEGER,
  min_players INTEGER DEFAULT 1,
  estimated_duration TEXT,
  game_type TEXT DEFAULT 'skill',
  external_url TEXT,
  organizer_name TEXT,
  organizer_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  requirement_title TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  equipment_needed TEXT,
  skill_level_required TEXT,
  order_index INTEGER DEFAULT 0,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_eligibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table games;
alter publication supabase_realtime add table game_requirements;
alter publication supabase_realtime add table game_eligibility;
alter publication supabase_realtime add table saved_games;