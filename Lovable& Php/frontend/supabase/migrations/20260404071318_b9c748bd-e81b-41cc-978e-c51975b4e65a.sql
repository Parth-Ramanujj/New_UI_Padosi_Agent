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