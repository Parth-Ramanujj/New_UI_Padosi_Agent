
-- 1. Fix user_roles: Add admin-only INSERT/UPDATE/DELETE policies to prevent privilege escalation
CREATE POLICY "Only admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix agent_analytics INSERT policy: add has_role check
DROP POLICY IF EXISTS "Agents can insert their own analytics" ON public.agent_analytics;
CREATE POLICY "Agents can insert their own analytics"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = agent_id) AND has_role(auth.uid(), 'agent'::app_role));

-- 3. Fix public_agent_info view: recreate with security_invoker = true
DROP VIEW IF EXISTS public.public_agent_info;
CREATE VIEW public.public_agent_info
WITH (security_invoker = true) AS
SELECT
  p.id, p.full_name, p.avatar_url,
  ap.bio, ap.company_name, ap.location,
  ap.years_experience, ap.insurance_segments,
  ap.specializations, ap.languages, ap.license_number,
  ap.subscription_plan, ap.is_profile_approved,
  ap.cover_page, ap.claims_amount, ap.claims_processed,
  ap.claims_settled, ap.success_rate, ap.approx_client_base,
  ap.response_time, ap.show_contact_info,
  ap.wants_claims_leads, ap.wants_portfolio_leads,
  ap.product_portfolio, ap.serviceable_cities
FROM profiles p
JOIN agent_profiles ap ON p.id = ap.id
WHERE ap.is_profile_approved = true;
GRANT SELECT ON public.public_agent_info TO anon, authenticated;

-- 4. Add SELECT policies on underlying tables for anon users so the security_invoker view works
CREATE POLICY "Anon can read approved agent profiles"
ON public.agent_profiles
FOR SELECT
TO anon
USING (is_profile_approved = true);

CREATE POLICY "Anon can read profiles of approved agents"
ON public.profiles
FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM public.agent_profiles ap
  WHERE ap.id = profiles.id AND ap.is_profile_approved = true
));
