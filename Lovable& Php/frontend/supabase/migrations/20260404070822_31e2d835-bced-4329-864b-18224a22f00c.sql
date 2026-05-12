-- Fix user_activity_safe view to use security_invoker so it respects RLS on user_activity_log
CREATE OR REPLACE VIEW public.user_activity_safe
WITH (security_invoker = true)
AS
SELECT id, user_id, action_type, metadata, created_at
FROM public.user_activity_log;

-- Allow users to read their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());