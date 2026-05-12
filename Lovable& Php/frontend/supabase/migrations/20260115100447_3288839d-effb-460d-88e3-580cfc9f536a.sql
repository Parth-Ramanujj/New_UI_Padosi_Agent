-- Add new columns to profiles table for basic details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS residence_address text;

-- Add new columns to agent_profiles for comprehensive profile
ALTER TABLE public.agent_profiles 
ADD COLUMN IF NOT EXISTS pan_number text,
ADD COLUMN IF NOT EXISTS office_address text,
ADD COLUMN IF NOT EXISTS serviceable_cities text[],
ADD COLUMN IF NOT EXISTS approx_client_base text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS has_pos_license boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS family_licenses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS insurance_segments text[],
ADD COLUMN IF NOT EXISTS health_expertise jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS life_expertise jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS motor_expertise jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS sme_expertise jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS product_portfolio jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS google_business_profile text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS youtube text,
ADD COLUMN IF NOT EXISTS career_highlights text,
ADD COLUMN IF NOT EXISTS wants_portfolio_leads boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS portfolio_lead_charging text,
ADD COLUMN IF NOT EXISTS portfolio_lead_amount integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS wants_claims_leads boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claims_lead_charging text,
ADD COLUMN IF NOT EXISTS claims_lead_amount integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS declarations_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS declarations_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['English']::text[];