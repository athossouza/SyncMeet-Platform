-- Run this in your Supabase Dashboard > SQL Editor

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS attendees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS meet_link TEXT;

-- Verify google_event_id exists (it should from initial schema, but good to check)
-- ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS google_event_id TEXT UNIQUE;
