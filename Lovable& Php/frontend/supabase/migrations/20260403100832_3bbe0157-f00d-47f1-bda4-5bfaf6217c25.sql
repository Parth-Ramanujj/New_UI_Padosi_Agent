
-- Fix: Prevent agents from self-approving or modifying admin-controlled fields
-- Drop the existing permissive agent update policy
DROP POLICY IF EXISTS "Agents can update their own agent profile" ON public.agent_profiles;

-- Recreate with WITH CHECK that prevents modifying admin-controlled columns
CREATE POLICY "Agents can update their own agent profile"
ON public.agent_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND has_role(auth.uid(), 'agent'::app_role))
WITH CHECK (
  auth.uid() = id AND has_role(auth.uid(), 'agent'::app_role)
  AND is_profile_approved IS NOT DISTINCT FROM (SELECT ap.is_profile_approved FROM public.agent_profiles ap WHERE ap.id = auth.uid())
  AND subscription_plan IS NOT DISTINCT FROM (SELECT ap.subscription_plan FROM public.agent_profiles ap WHERE ap.id = auth.uid())
  AND subscription_expires_at IS NOT DISTINCT FROM (SELECT ap.subscription_expires_at FROM public.agent_profiles ap WHERE ap.id = auth.uid())
  AND onboarded_by IS NOT DISTINCT FROM (SELECT ap.onboarded_by FROM public.agent_profiles ap WHERE ap.id = auth.uid())
);
