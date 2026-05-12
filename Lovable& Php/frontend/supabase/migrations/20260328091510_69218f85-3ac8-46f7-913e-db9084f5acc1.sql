-- Fix PII exposure: prevent anonymous direct reads from base tables while keeping public-safe view access
ALTER VIEW public.public_agent_info SET (security_invoker = false);

DROP POLICY IF EXISTS "Anon can read approved agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Anon can read profiles of approved agents" ON public.profiles;

GRANT SELECT ON public.public_agent_info TO anon, authenticated;