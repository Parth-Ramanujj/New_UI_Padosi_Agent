
-- 1. Remove anon SELECT policy from agent_profiles (public reads go through public_agent_info view)
DROP POLICY IF EXISTS "Anon can read approved agent profiles" ON public.agent_profiles;

-- 2. Fix agent_analytics UPDATE policy to require agent role
DROP POLICY IF EXISTS "Agents can update their own analytics" ON public.agent_analytics;

CREATE POLICY "Agents can update their own analytics"
  ON public.agent_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));
