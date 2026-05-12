-- Fix 3: Remove user SELECT policy on review_verification_data
DROP POLICY IF EXISTS "Users can view their own verification data" ON public.review_verification_data;

-- Fix 4: Create a security barrier view for user_activity_log excluding ip_address
CREATE OR REPLACE VIEW public.user_activity_safe
WITH (security_barrier = true)
AS SELECT id, user_id, action_type, metadata, created_at
FROM public.user_activity_log;