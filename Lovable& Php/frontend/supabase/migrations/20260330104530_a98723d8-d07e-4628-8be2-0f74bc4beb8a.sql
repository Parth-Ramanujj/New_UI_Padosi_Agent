-- Clean up duplicate anon policy on profiles
DROP POLICY IF EXISTS "Anon can read approved agent profiles via view" ON public.profiles;