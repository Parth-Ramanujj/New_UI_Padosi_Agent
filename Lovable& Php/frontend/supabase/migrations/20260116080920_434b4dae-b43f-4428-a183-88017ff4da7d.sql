-- =============================================
-- SECURITY FIX: Address 4 error-level security issues
-- =============================================

-- 1. FIX: PUBLIC_DATA_EXPOSURE (profiles_public_pii)
-- Remove the overly permissive public policy that exposes PII
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Create a view for public agent info (only approved agents, limited fields)
CREATE OR REPLACE VIEW public.public_agent_info 
WITH (security_invoker = on) AS
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
  ap.is_profile_approved
FROM public.profiles p
INNER JOIN public.agent_profiles ap ON p.id = ap.id
WHERE ap.is_profile_approved = true;

-- Grant select on the view to anon (for public agent listings)
GRANT SELECT ON public.public_agent_info TO anon;
GRANT SELECT ON public.public_agent_info TO authenticated;

-- 2. FIX: INFO_LEAKAGE (review_user_linkage)
-- Create a public view for reviews that excludes user_id
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.agent_reviews;

CREATE OR REPLACE VIEW public.public_agent_reviews
WITH (security_invoker = on) AS
SELECT 
  id,
  agent_id,
  rating,
  comment,
  created_at,
  is_approved
FROM public.agent_reviews
WHERE is_approved = true;

-- Grant select on the public reviews view
GRANT SELECT ON public.public_agent_reviews TO anon;
GRANT SELECT ON public.public_agent_reviews TO authenticated;

-- Now agent_reviews base table should only be accessible to authenticated users
-- who are either viewing their own reviews or are the agent
CREATE POLICY "Users can view their own reviews"
ON public.agent_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Agents can view reviews on their profile"
ON public.agent_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = agent_id);

-- 3. FIX: OPEN_ENDPOINTS (analytics_client_tracking)
-- Create a database function and trigger to track analytics securely
-- Analytics will be tracked when leads are created, not from client-side calls

-- First, remove any existing anon access to agent_analytics
-- The existing policies already restrict to agents only, which is good

-- Create a trigger function to increment contact_requests when a lead is created
CREATE OR REPLACE FUNCTION public.increment_contact_requests_on_lead()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_analytics (agent_id, date, page_views, contact_requests, profile_clicks)
  VALUES (NEW.agent_id, CURRENT_DATE, 0, 1, 0)
  ON CONFLICT (agent_id, date) 
  DO UPDATE SET contact_requests = agent_analytics.contact_requests + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on leads table
DROP TRIGGER IF EXISTS trigger_increment_contact_requests ON public.leads;
CREATE TRIGGER trigger_increment_contact_requests
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.increment_contact_requests_on_lead();

-- Add unique constraint on agent_analytics if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'agent_analytics_agent_id_date_key'
  ) THEN
    ALTER TABLE public.agent_analytics ADD CONSTRAINT agent_analytics_agent_id_date_key UNIQUE (agent_id, date);
  END IF;
END $$;

-- 4. Additional security: Ensure agent_reviews INSERT requires authenticated user with proper user_id
-- Already exists: "Users can create reviews" policy requires auth.uid() = user_id