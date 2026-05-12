-- Recreate view WITHOUT security_invoker so it's publicly readable (like original)
-- This is intentional: public_agent_info is a public directory of approved agents
DROP VIEW IF EXISTS public.public_agent_info;

CREATE VIEW public.public_agent_info AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  ap.location,
  ap.years_experience,
  ap.specializations,
  ap.languages,
  ap.license_number,
  ap.subscription_plan,
  ap.cover_page,
  ap.bio,
  ap.is_profile_approved,
  ap.claims_settled,
  ap.claims_amount,
  ap.claims_processed,
  ap.success_rate,
  ap.approx_client_base,
  ap.wants_claims_leads,
  ap.wants_portfolio_leads,
  ap.insurance_segments,
  ap.serviceable_cities,
  ap.response_time,
  ap.company_name,
  ap.product_portfolio,
  ap.show_contact_info,
  CASE WHEN ap.show_contact_info = true THEN p.phone ELSE NULL END AS phone,
  CASE WHEN ap.show_contact_info = true THEN p.whatsapp_number ELSE NULL END AS whatsapp_number
FROM profiles p
JOIN agent_profiles ap ON p.id = ap.id
WHERE ap.is_profile_approved = true;