
-- 1. Create a public_profiles view excluding sensitive fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT id, full_name, display_name, avatar_url, is_verified
FROM public.profiles;

-- 2. Drop the anon policy that exposes all columns
DROP POLICY IF EXISTS "Anon can read profiles of approved agents" ON public.profiles;

-- 3. Create a new anon policy that denies direct access to profiles table
CREATE POLICY "Anon cannot read profiles directly"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

-- 4. Fix gallery write policies to require agent role
DROP POLICY IF EXISTS "Agents can insert their own gallery images" ON public.agent_gallery_images;
DROP POLICY IF EXISTS "Agents can update their own gallery images" ON public.agent_gallery_images;
DROP POLICY IF EXISTS "Agents can delete their own gallery images" ON public.agent_gallery_images;

CREATE POLICY "Agents can insert their own gallery images"
  ON public.agent_gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "Agents can update their own gallery images"
  ON public.agent_gallery_images FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "Agents can delete their own gallery images"
  ON public.agent_gallery_images FOR DELETE
  TO authenticated
  USING (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));

-- 5. Fix agent_profiles self-view policy to require agent role
DROP POLICY IF EXISTS "Agents can view their own agent profile" ON public.agent_profiles;

CREATE POLICY "Agents can view their own agent profile"
  ON public.agent_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND has_role(auth.uid(), 'agent'::app_role));
