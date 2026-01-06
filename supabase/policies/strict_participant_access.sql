-- Strict Participant Access Policy
-- Enables RLS where a user can ONLY see a session if:
-- 1. They are an Admin (role='admin' in profiles)
-- 2. OR their email is present in the `attendees` JSONB array.

-- Drop existing "Client" policy to replace it
DROP POLICY IF EXISTS "Clients can view own org sessions" ON public.sessions;

-- Create new Strict Policy
CREATE POLICY "Clients can view participating sessions" ON public.sessions
    FOR SELECT USING (
        -- Admin Check
        public.is_admin()
        OR
        -- Participant Check
        (
            EXISTS (
                SELECT 1 
                FROM jsonb_array_elements(attendees) as attendee 
                WHERE attendee->>'email' = auth.jwt()->>'email'
            )
        )
    );
