CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_value INTEGER NOT NULL,
  prize_description VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) DEFAULT 'intermediate',
  entry_fee INTEGER DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  organizer_name VARCHAR(255),
  organizer_email VARCHAR(255),
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competition_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  requirement_type VARCHAR(100) NOT NULL,
  requirement_description TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competition_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  requirement_title VARCHAR(255) NOT NULL,
  requirement_description TEXT NOT NULL,
  submission_format VARCHAR(100),
  file_size_limit INTEGER,
  additional_notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

INSERT INTO competitions (title, description, thumbnail_url, deadline, prize_value, prize_description, category, difficulty_level, organizer_name, organizer_email, external_url) VALUES
('UI/UX Design Challenge 2024', 'Create an innovative mobile app interface for a sustainable living platform', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', NOW() + INTERVAL '10 days', 2500, '$2,500 Cash Prize', 'Design', 'intermediate', 'Design Studio Pro', 'contact@designstudio.com', 'https://designstudio.com/challenge'),
('Mobile App Development Contest', 'Build a cross-platform mobile application using React Native or Flutter', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80', NOW() + INTERVAL '14 days', 5000, '$5,000 + Job Opportunity', 'Development', 'advanced', 'TechCorp Solutions', 'hr@techcorp.com', 'https://techcorp.com/contest'),
('Logo Design Competition', 'Design a modern logo for a sustainable fashion brand', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80', NOW() + INTERVAL '7 days', 1000, '$1,000 + Brand Partnership', 'Design', 'beginner', 'EcoFashion Co.', 'design@ecofashion.com', 'https://ecofashion.com/logo-contest'),
('Content Writing Challenge', 'Write compelling blog posts about emerging technologies', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80', NOW() + INTERVAL '21 days', 1500, '$1,500 + Publication Credits', 'Writing', 'intermediate', 'Tech Blog Network', 'editor@techblog.com', 'https://techblog.com/writing-challenge'),
('Social Media Campaign Contest', 'Create a viral marketing campaign for a new product launch', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80', NOW() + INTERVAL '5 days', 3000, '$3,000 + Marketing Internship', 'Marketing', 'intermediate', 'Digital Marketing Agency', 'campaigns@digitalagency.com', 'https://digitalagency.com/campaign-contest'),
('Photography Contest 2024', 'Capture the beauty of urban landscapes in your city', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', NOW() + INTERVAL '30 days', 2000, '$2,000 + Gallery Exhibition', 'Photography', 'beginner', 'Urban Photography Society', 'gallery@urbanphoto.com', 'https://urbanphoto.com/contest');

INSERT INTO competition_eligibility (competition_id, requirement_type, requirement_description, is_mandatory) 
SELECT 
  c.id,
  'Age Requirement',
  'Must be 18 years or older',
  true
FROM competitions c
WHERE c.title = 'UI/UX Design Challenge 2024';

INSERT INTO competition_eligibility (competition_id, requirement_type, requirement_description, is_mandatory) 
SELECT 
  c.id,
  'Experience Level',
  'Minimum 2 years of UI/UX design experience',
  false
FROM competitions c
WHERE c.title = 'UI/UX Design Challenge 2024';

INSERT INTO competition_requirements (competition_id, requirement_title, requirement_description, submission_format, order_index)
SELECT 
  c.id,
  'Design Mockups',
  'Submit high-fidelity mockups for at least 5 key screens',
  'Figma, Sketch, or Adobe XD files',
  1
FROM competitions c
WHERE c.title = 'UI/UX Design Challenge 2024';

INSERT INTO competition_requirements (competition_id, requirement_title, requirement_description, submission_format, order_index)
SELECT 
  c.id,
  'User Flow Diagram',
  'Provide a comprehensive user flow diagram showing the app navigation',
  'PDF or image format',
  2
FROM competitions c
WHERE c.title = 'UI/UX Design Challenge 2024';

INSERT INTO competition_requirements (competition_id, requirement_title, requirement_description, submission_format, order_index)
SELECT 
  c.id,
  'Design Rationale',
  'Write a 500-word explanation of your design decisions and user research',
  'PDF document',
  3
FROM competitions c
WHERE c.title = 'UI/UX Design Challenge 2024';

alter publication supabase_realtime add table competitions;
alter publication supabase_realtime add table competition_eligibility;
alter publication supabase_realtime add table competition_requirements;
alter publication supabase_realtime add table saved_competitions;