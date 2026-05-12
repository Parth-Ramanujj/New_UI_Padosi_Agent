-- 1. Fix: Storage gallery policies - change DELETE and UPDATE from public to authenticated
DROP POLICY IF EXISTS "Agents can delete their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete their gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their gallery images" ON storage.objects;

CREATE POLICY "Agents can delete their gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'agent'::public.app_role)
);

CREATE POLICY "Agents can update their gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'agent'::public.app_role)
);