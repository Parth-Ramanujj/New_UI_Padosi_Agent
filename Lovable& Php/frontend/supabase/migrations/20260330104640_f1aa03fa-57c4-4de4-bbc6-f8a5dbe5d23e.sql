-- 1. Fix: Restrict anon profiles policy to only non-PII columns
-- The view already filters columns, but the base table policy exposes all columns
-- Replace with a policy that still allows the view to work but limits direct access
DROP POLICY IF EXISTS "Anon can read profiles of approved agents only" ON public.profiles;

-- Use a function to restrict what anon can see - but RLS can't restrict columns
-- The proper fix: remove anon access to base tables entirely and use security_invoker=false views
-- OR: accept that the view already handles column filtering and the base table policy is needed for security_invoker=true views

-- Better approach: Switch back to security_invoker=false for public views (which the Supabase linter no longer flags since we resolved it)
-- Actually, let's use a more targeted approach: create wrapper functions

-- Simplest secure fix: remove anon access to base tables and convert views back to security_invoker=false
-- But add column restrictions in the view definitions

DROP POLICY IF EXISTS "Anon can read approved agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Anon can read approved reviews" ON public.agent_reviews;

-- Recreate views as SECURITY DEFINER (security_invoker=false) which is the correct pattern
-- for public marketplace listings that need to expose limited data to anonymous users
DROP VIEW IF EXISTS public.public_agent_info;
CREATE VIEW public.public_agent_info
WITH (security_invoker = false) AS
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

DROP VIEW IF EXISTS public.public_agent_reviews;
CREATE VIEW public.public_agent_reviews
WITH (security_invoker = false) AS
SELECT id, agent_id, rating, comment, created_at, is_approved
FROM agent_reviews
WHERE is_approved = true;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, display_name, avatar_url, is_verified
FROM profiles;

GRANT SELECT ON public.public_agent_info TO anon, authenticated;
GRANT SELECT ON public.public_agent_reviews TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Fix: Remove the overly permissive storage policy
DROP POLICY IF EXISTS "Agents can upload gallery images" ON storage.objects;