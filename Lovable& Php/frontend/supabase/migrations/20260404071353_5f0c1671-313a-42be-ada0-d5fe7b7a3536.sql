-- Drop and recreate the agent self-update policy with additional immutability checks
DROP POLICY IF EXISTS "Agents can update their own agent profile" ON public.agent_profiles;

CREATE POLICY "Agents can update their own agent profile"
ON public.agent_profiles
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) AND has_role(auth.uid(), 'agent'::app_role)
)
WITH CHECK (
  (auth.uid() = id)
  AND has_role(auth.uid(), 'agent'::app_role)
  -- Prevent agents from changing admin-controlled fields
  AND (NOT (is_profile_approved IS DISTINCT FROM (SELECT ap.is_profile_approved FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (subscription_plan IS DISTINCT FROM (SELECT ap.subscription_plan FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (subscription_expires_at IS DISTINCT FROM (SELECT ap.subscription_expires_at FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (onboarded_by IS DISTINCT FROM (SELECT ap.onboarded_by FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (pending_changes IS DISTINCT FROM (SELECT ap.pending_changes FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (declarations_accepted IS DISTINCT FROM (SELECT ap.declarations_accepted FROM agent_profiles ap WHERE ap.id = auth.uid())))
  AND (NOT (declarations_accepted_at IS DISTINCT FROM (SELECT ap.declarations_accepted_at FROM agent_profiles ap WHERE ap.id = auth.uid())))
);