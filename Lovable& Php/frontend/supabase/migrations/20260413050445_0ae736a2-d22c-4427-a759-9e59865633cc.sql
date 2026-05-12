
-- Add pincode columns to profiles and agent_profiles tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residence_pincode TEXT;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS office_pincode TEXT;
