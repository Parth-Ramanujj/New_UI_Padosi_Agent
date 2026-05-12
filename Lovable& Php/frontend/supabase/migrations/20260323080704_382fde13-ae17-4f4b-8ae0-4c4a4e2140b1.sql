-- Fix 1: Recreate public_agent_info view with security_invoker = true
DROP VIEW IF EXISTS public.public_agent_info;
CREATE VIEW public.public_agent_info
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  ap.bio,
  ap.company_name,
  ap.location,
  ap.years_experience,
  ap.insurance_segments,
  ap.specializations,
  ap.languages,
  ap.license_number,
  ap.subscription_plan,
  ap.is_profile_approved,
  ap.cover_page,
  ap.claims_amount,
  ap.claims_processed,
  ap.claims_settled,
  ap.success_rate,
  ap.approx_client_base,
  ap.response_time,
  ap.show_contact_info,
  ap.wants_claims_leads,
  ap.wants_portfolio_leads,
  ap.product_portfolio,
  ap.serviceable_cities
FROM profiles p
JOIN agent_profiles ap ON p.id = ap.id
WHERE ap.is_profile_approved = true;

GRANT SELECT ON public.public_agent_info TO anon, authenticated;

-- Fix 2: Move admin_notes to a separate admin-only table
CREATE TABLE IF NOT EXISTS public.agent_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL UNIQUE,
  notes text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin notes"
  ON public.agent_admin_notes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert admin notes"
  ON public.agent_admin_notes FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update admin notes"
  ON public.agent_admin_notes FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing admin_notes data
INSERT INTO public.agent_admin_notes (agent_id, notes)
SELECT id, admin_notes FROM public.agent_profiles WHERE admin_notes IS NOT NULL
ON CONFLICT (agent_id) DO NOTHING;

-- Remove admin_notes from agent_profiles
ALTER TABLE public.agent_profiles DROP COLUMN IF EXISTS admin_notes;