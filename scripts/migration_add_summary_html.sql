ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS summary_html TEXT;

-- Update existing rows to have summary_html equal to summary_text if missing, to avoid nulls where text exists
UPDATE public.sessions SET summary_html = summary_text WHERE summary_html IS NULL AND summary_text IS NOT NULL;
