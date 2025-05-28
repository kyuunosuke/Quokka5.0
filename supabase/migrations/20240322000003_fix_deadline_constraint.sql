-- Make deadline column nullable since we now use start_date and end_date
ALTER TABLE competitions ALTER COLUMN deadline DROP NOT NULL;

-- Update existing records to use end_date as deadline if deadline is null
UPDATE competitions SET deadline = end_date WHERE deadline IS NULL AND end_date IS NOT NULL;

-- For records where both are null, set a default deadline
UPDATE competitions SET deadline = NOW() + INTERVAL '30 days' WHERE deadline IS NULL;
