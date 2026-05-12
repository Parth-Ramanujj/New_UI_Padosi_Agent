-- 1. Fix: Storage upload policy - add agent role check for agent-gallery bucket
-- Drop overly permissive INSERT policies on storage.objects
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to agent-gallery" ON storage.objects;

-- Create properly scoped policy requiring agent role
CREATE POLICY "Only agents can upload to agent-gallery"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-gallery'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.has_role(auth.uid(), 'agent'::public.app_role)
);

-- 2. Fix: Add user self-access policies for review_verification_data
-- Allow users to view their own verification data
CREATE POLICY "Users can view their own verification data"
ON public.review_verification_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_reviews ar
    WHERE ar.id = review_verification_data.review_id
    AND ar.user_id = auth.uid()
  )
);

-- Allow users to delete their own verification data (GDPR compliance)
CREATE POLICY "Users can delete their own verification data"
ON public.review_verification_data
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_reviews ar
    WHERE ar.id = review_verification_data.review_id
    AND ar.user_id = auth.uid()
  )
);