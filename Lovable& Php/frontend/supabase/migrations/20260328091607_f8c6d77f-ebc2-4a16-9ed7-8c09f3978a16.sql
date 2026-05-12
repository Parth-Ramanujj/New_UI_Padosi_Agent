-- Resolve PAN exposure without SECURITY DEFINER view
-- 1) Use SECURITY INVOKER on public view (passes linter)
ALTER VIEW public.public_agent_info SET (security_invoker = true);

-- 2) Restore anon row filters needed by the invoker view
DROP POLICY IF EXISTS "Anon can read approved agent profiles" ON public.agent_profiles;
CREATE POLICY "Anon can read approved agent profiles"
ON public.agent_profiles
FOR SELECT
TO anon
USING (is_profile_approved = true);

DROP POLICY IF EXISTS "Anon can read profiles of approved agents" ON public.profiles;
CREATE POLICY "Anon can read profiles of approved agents"
ON public.profiles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.agent_profiles ap
    WHERE ap.id = profiles.id
      AND ap.is_profile_approved = true
  )
);

-- 3) Restrict anon column access on base tables to only safe public columns
REVOKE SELECT ON public.agent_profiles FROM anon;
GRANT SELECT (
  id,
  bio,
  company_name,
  location,
  years_experience,
  insurance_segments,
  specializations,
  languages,
  license_number,
  subscription_plan,
  cover_page,
  claims_amount,
  claims_processed,
  claims_settled,
  success_rate,
  approx_client_base,
  response_time,
  show_contact_info,
  wants_claims_leads,
  wants_portfolio_leads,
  product_portfolio,
  serviceable_cities,
  is_profile_approved
) ON public.agent_profiles TO anon;

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id,
  full_name,
  avatar_url
) ON public.profiles TO anon;

-- 4) Keep explicit view grant
GRANT SELECT ON public.public_agent_info TO anon, authenticated;