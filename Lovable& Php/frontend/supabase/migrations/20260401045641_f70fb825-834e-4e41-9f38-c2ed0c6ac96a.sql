-- Fix 2: Remove agent INSERT/UPDATE RLS policies on agent_analytics
-- Analytics should only be written by server-side edge functions (track-view)
DROP POLICY IF EXISTS "Agents can insert their own analytics" ON public.agent_analytics;
DROP POLICY IF EXISTS "Agents can update their own analytics" ON public.agent_analytics;