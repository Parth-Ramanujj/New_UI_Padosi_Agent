-- 1. Drop and recreate storage upload policies with file extension whitelist

-- agent-gallery bucket: update INSERT policy
DROP POLICY IF EXISTS "Agents can upload gallery images" ON storage.objects;
CREATE POLICY "Agents can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

-- agent-gallery bucket: update UPDATE policy
DROP POLICY IF EXISTS "Agents can update their gallery images" ON storage.objects;
CREATE POLICY "Agents can update their gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

-- avatars bucket: update INSERT policy
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

-- avatars bucket: update UPDATE policy
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

-- 2. Newsletter: allow anyone to deactivate their subscription by email match
CREATE POLICY "Subscribers can deactivate their own subscription"
ON public.newsletter_subscribers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
  is_active = false
);