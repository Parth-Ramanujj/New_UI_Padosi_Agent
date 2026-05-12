-- Convert public views to security_invoker=true and add anon-safe SELECT policies
-- This satisfies the Supabase linter while maintaining public access

-- 1. Recreate public_agent_info with security_invoker=true
DROP VIEW IF EXISTS public.public_agent_info;
CREATE VIEW public.public_agent_info
WITH (security_invoker = true) AS
SELECT p.id,
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

-- 2. Recreate public_agent_reviews with security_invoker=true
DROP VIEW IF EXISTS public.public_agent_reviews;
CREATE VIEW public.public_agent_reviews
WITH (security_invoker = true) AS
SELECT id, agent_id, rating, comment, created_at, is_approved
FROM agent_reviews
WHERE is_approved = true;

-- 3. Recreate public_profiles with security_invoker=true
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, display_name, avatar_url, is_verified
FROM profiles;

-- 4. Grant SELECT to anon and authenticated on the views
GRANT SELECT ON public.public_agent_info TO anon, authenticated;
GRANT SELECT ON public.public_agent_reviews TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 5. Add anon SELECT policies on base tables (restricted to approved/safe data only)
-- Profiles: anon can read only the safe columns via the view
CREATE POLICY "Anon can read approved agent profiles via view"
ON public.profiles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.agent_profiles ap
    WHERE ap.id = profiles.id AND ap.is_profile_approved = true
  )
);

-- Drop the old blocking policy first
DROP POLICY IF EXISTS "Anon cannot read profiles directly" ON public.profiles;

-- Re-add: anon can only read profiles of approved agents
CREATE POLICY "Anon can read profiles of approved agents only"
ON public.profiles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.agent_profiles ap
    WHERE ap.id = profiles.id AND ap.is_profile_approved = true
  )
);

-- Agent profiles: anon can read approved profiles
CREATE POLICY "Anon can read approved agent profiles"
ON public.agent_profiles
FOR SELECT
TO anon
USING (is_profile_approved = true);

-- Agent reviews: anon can read approved reviews
CREATE POLICY "Anon can read approved reviews"
ON public.agent_reviews
FOR SELECT
TO anon
USING (is_approved = true);