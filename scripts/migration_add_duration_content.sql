-- Add duration_seconds for precise video length
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add summary_html to store the actual content of the Google Doc
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS summary_html TEXT;
