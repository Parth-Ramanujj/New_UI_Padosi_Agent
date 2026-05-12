ALTER TABLE public.agent_profiles
  ADD COLUMN IF NOT EXISTS show_experience boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_claims_stats boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_client_base boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_ratings boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_links boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_languages boolean NOT NULL DEFAULT true;