ALTER TABLE competitions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

UPDATE competitions SET start_date = NOW(), end_date = deadline WHERE start_date IS NULL;