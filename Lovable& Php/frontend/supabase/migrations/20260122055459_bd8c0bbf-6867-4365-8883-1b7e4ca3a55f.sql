-- Add performance stats columns to agent_profiles table
ALTER TABLE public.agent_profiles 
ADD COLUMN IF NOT EXISTS claims_processed text DEFAULT '0',
ADD COLUMN IF NOT EXISTS claims_settled integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS claims_amount text DEFAULT '₹0',
ADD COLUMN IF NOT EXISTS success_rate text DEFAULT '0%',
ADD COLUMN IF NOT EXISTS response_time text DEFAULT '< 24 hours';

-- Add comment for documentation
COMMENT ON COLUMN public.agent_profiles.claims_processed IS 'Number of claims processed (e.g., "150+")';
COMMENT ON COLUMN public.agent_profiles.claims_settled IS 'Number of claims successfully settled';
COMMENT ON COLUMN public.agent_profiles.claims_amount IS 'Total value of claims settled (e.g., "₹2.5 Cr")';
COMMENT ON COLUMN public.agent_profiles.success_rate IS 'Claim success rate percentage (e.g., "98%")';
COMMENT ON COLUMN public.agent_profiles.response_time IS 'Typical response time (e.g., "< 2 hours")';