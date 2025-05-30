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
  'Caption This',
  'Upload a picture or meme and let users submit their wittiest captions. Vote for the funniest responses and crown the caption champion!',
  'Creative',
  'beginner',
  'creative',
  2,
  50,
  '10-20 minutes',
  'Quokkamole Games',
  'active',
  now()
);

INSERT INTO game_requirements (id, game_id, requirement_title, requirement_description, order_index)
SELECT 
  gen_random_uuid(),
  g.id,
  'Image Upload',
  'Upload a funny picture, meme, or interesting image that needs a caption',
  1
FROM games g WHERE g.title = 'Caption This';

INSERT INTO game_requirements (id, game_id, requirement_title, requirement_description, order_index)
SELECT 
  gen_random_uuid(),
  g.id,
  'Creative Writing',
  'Submit witty, funny, or clever captions for the uploaded images',
  2
FROM games g WHERE g.title = 'Caption This';

INSERT INTO game_eligibility (id, game_id, requirement_type, requirement_description, is_mandatory)
SELECT 
  gen_random_uuid(),
  g.id,
  'Age Requirement',
  'Must be 13 years or older',
  true
FROM games g WHERE g.title = 'Caption This';

INSERT INTO game_eligibility (id, game_id, requirement_type, requirement_description, is_mandatory)
SELECT 
  gen_random_uuid(),
  g.id,
  'Content Guidelines',
  'All captions must be appropriate and follow community guidelines',
  true
FROM games g WHERE g.title = 'Caption This';
