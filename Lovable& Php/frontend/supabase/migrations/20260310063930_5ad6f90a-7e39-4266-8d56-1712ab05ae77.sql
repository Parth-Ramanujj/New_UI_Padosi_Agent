
-- Add profile section toggle columns to agent_profiles
ALTER TABLE public.agent_profiles
  ADD COLUMN IF NOT EXISTS show_full_profile boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_certificates boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_achievements boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_comments boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_gallery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_contact_info boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT null;

-- Admin can view all agent profiles
CREATE POLICY "Admins can view all agent profiles"
ON public.agent_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all agent profiles
CREATE POLICY "Admins can update all agent profiles"
ON public.agent_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all analytics
CREATE POLICY "Admins can view all analytics"
ON public.agent_analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.agent_reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all reviews
CREATE POLICY "Admins can update all reviews"
ON public.agent_reviews
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all distributor profiles
CREATE POLICY "Admins can view all distributor profiles"
ON public.distributor_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all distributor profiles
CREATE POLICY "Admins can update all distributor profiles"
ON public.distributor_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all distributor agents
CREATE POLICY "Admins can view all distributor agents"
ON public.distributor_agents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all renewal reminders
CREATE POLICY "Admins can view all renewal reminders"
ON public.renewal_reminders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert renewal reminders
CREATE POLICY "Admins can insert renewal reminders"
ON public.renewal_reminders
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all newsletter subscribers
CREATE POLICY "Admins can view all newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
