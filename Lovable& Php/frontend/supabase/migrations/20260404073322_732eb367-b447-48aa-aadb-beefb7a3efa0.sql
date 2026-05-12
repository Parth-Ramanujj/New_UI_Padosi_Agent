-- 1. Remove the permissive newsletter UPDATE policy (no ownership check possible without user_id)
DROP POLICY IF EXISTS "Subscribers can deactivate their own subscription" ON public.newsletter_subscribers;

-- 2. Fix storage: ensure gallery upload INSERT policy includes role check
DROP POLICY IF EXISTS "Agents can upload gallery images" ON storage.objects;
CREATE POLICY "Agents can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
  AND has_role(auth.uid(), 'agent'::app_role)
);

-- 3. Fix storage: ensure gallery UPDATE policy includes role check
DROP POLICY IF EXISTS "Agents can update their gallery images" ON storage.objects;
CREATE POLICY "Agents can update their gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'agent'::app_role)
)
WITH CHECK (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
  AND has_role(auth.uid(), 'agent'::app_role)
);