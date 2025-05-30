INSERT INTO games (
  id,
  title,
  description,
  category,
  difficulty_level,
  game_type,
  min_players,
  max_players,
  estimated_duration,
  organizer_name,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  'Guess the Sound',
  'Listen to mysterious sound clips and test your audio recognition skills. Can you identify everyday sounds, nature sounds, or unique audio clips?',
  'Puzzle',
  'intermediate',
  'skill',
  1,
  100,
  '5-15 minutes',
  'Quokkamole Games',
  'active',
  now()
);

INSERT INTO game_requirements (id, game_id, requirement_title, requirement_description, order_index)
SELECT 
  gen_random_uuid(),
  g.id,
  'Audio Equipment',
  'Working speakers or headphones to listen to sound clips',
  1
FROM games g WHERE g.title = 'Guess the Sound';

INSERT INTO game_requirements (id, game_id, requirement_title, requirement_description, order_index)
SELECT 
  gen_random_uuid(),
  g.id,
  'Listening Skills',
  'Carefully listen to audio clips and submit your best guess for what the sound is',
  2
FROM games g WHERE g.title = 'Guess the Sound';

INSERT INTO game_eligibility (id, game_id, requirement_type, requirement_description, is_mandatory)
SELECT 
  gen_random_uuid(),
  g.id,
  'Age Requirement',
  'Must be 8 years or older',
  true
FROM games g WHERE g.title = 'Guess the Sound';

INSERT INTO game_eligibility (id, game_id, requirement_type, requirement_description, is_mandatory)
SELECT 
  gen_random_uuid(),
  g.id,
  'Audio Capability',
  'Device must be capable of playing audio files',
  true
FROM games g WHERE g.title = 'Guess the Sound';


