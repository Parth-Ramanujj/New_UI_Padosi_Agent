-- Fix review moderation bypass: prevent users from self-approving reviews
-- Drop the permissive update policy
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.agent_reviews;

-- Recreate with restriction: users can only update comment and rating, NOT is_approved
CREATE POLICY "Users can update their own reviews"
ON public.agent_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND is_approved IS NOT DISTINCT FROM (SELECT ar.is_approved FROM public.agent_reviews ar WHERE ar.id = agent_reviews.id)
);