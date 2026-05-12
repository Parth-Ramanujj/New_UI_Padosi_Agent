-- Revoke public access to has_role function to prevent role enumeration
REVOKE EXECUTE ON FUNCTION public.has_role FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role FROM anon;

-- Only authenticated users should be able to use has_role (via RLS policies)
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;