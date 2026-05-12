
-- 1. Remove the user SELECT policy on review_verification_data (make it admin-only read)
DROP POLICY IF EXISTS "Users can view their own verification data" ON public.review_verification_data;

-- 2. Recreate user_activity_safe view with proper user-scoped filtering
DROP VIEW IF EXISTS public.user_activity_safe;
CREATE OR REPLACE VIEW public.user_activity_safe
WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  id,
  user_id,
  action_type,
  metadata,
  created_at
FROM public.user_activity_log
WHERE user_id = auth.uid();
