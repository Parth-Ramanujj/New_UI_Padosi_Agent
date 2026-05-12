-- 1. Revoke public EXECUTE on check_lead_rate_limit to prevent RPC info leak
-- The function is still usable inside RLS WITH CHECK policies (they run as policy owner)
REVOKE EXECUTE ON FUNCTION public.check_lead_rate_limit(uuid, uuid)
  FROM PUBLIC, anon, authenticated;

-- 2. Remove duplicate INSERT policy on agent-gallery that lacks file extension check
-- Keeping only "Agents can upload gallery images" which enforces the extension allowlist
DROP POLICY IF EXISTS "Only agents can upload to agent-gallery" ON storage.objects;