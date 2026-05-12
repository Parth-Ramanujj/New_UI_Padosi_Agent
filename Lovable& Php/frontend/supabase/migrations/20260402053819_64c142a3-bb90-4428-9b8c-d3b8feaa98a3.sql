CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  ORDER BY CASE ur.role
    WHEN 'admin' THEN 4
    WHEN 'distributor' THEN 3
    WHEN 'agent' THEN 2
    WHEN 'user' THEN 1
    ELSE 0
  END DESC
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.uid() = _user_id, false)
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view their own verification data" ON public.review_verification_data;
CREATE POLICY "Users can view their own verification data"
ON public.review_verification_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.agent_reviews ar
    WHERE ar.id = review_verification_data.review_id
      AND ar.user_id = auth.uid()
  )
);

CREATE OR REPLACE VIEW public.user_activity_safe
WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  id,
  user_id,
  action_type,
  metadata,
  created_at
FROM public.user_activity_log;