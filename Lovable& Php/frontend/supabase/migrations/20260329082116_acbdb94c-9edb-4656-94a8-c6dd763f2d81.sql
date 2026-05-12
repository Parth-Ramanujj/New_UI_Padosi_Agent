
-- Recreate public_agent_info as SECURITY DEFINER so anon users can read public agent data
-- The view already excludes sensitive fields (PAN, email, phone, address, etc.)
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

-- Recreate public_agent_reviews as SECURITY DEFINER so anon users can read approved reviews
DROP VIEW IF EXISTS public.public_agent_reviews;
CREATE VIEW public.public_agent_reviews
WITH (security_invoker = false) AS
SELECT id, agent_id, rating, comment, created_at, is_approved
FROM agent_reviews
WHERE is_approved = true;

-- Recreate public_profiles as SECURITY DEFINER so anon users can read safe profile fields
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, display_name, avatar_url, is_verified
FROM profiles;

-- Grant SELECT on all three views to anon and authenticated
GRANT SELECT ON public.public_agent_info TO anon, authenticated;
GRANT SELECT ON public.public_agent_reviews TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
