-- Add career_timeline column to store multiple timeline entries
ALTER TABLE public.agent_profiles
ADD COLUMN career_timeline jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.agent_profiles.career_timeline IS 'Array of career timeline entries with year, event, and type';