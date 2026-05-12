
-- Create separate table for reviewer PII (only accessible by review author and admins)
CREATE TABLE public.review_verification_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL UNIQUE,
    reviewer_name text,
    reviewer_mobile text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_verification_data ENABLE ROW LEVEL SECURITY;

-- Only the review author can insert verification data
CREATE POLICY "Users can insert their own verification data"
ON public.review_verification_data FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.agent_reviews ar
        WHERE ar.id = review_id AND ar.user_id = auth.uid()
    )
);

-- Only admins can view verification data (not the reviewed agent)
CREATE POLICY "Admins can view verification data"
ON public.review_verification_data FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing PII data
INSERT INTO public.review_verification_data (review_id, reviewer_name, reviewer_mobile)
SELECT id, reviewer_name, reviewer_mobile FROM public.agent_reviews
WHERE reviewer_name IS NOT NULL OR reviewer_mobile IS NOT NULL;

-- Drop PII columns from agent_reviews
ALTER TABLE public.agent_reviews DROP COLUMN IF EXISTS reviewer_name;
ALTER TABLE public.agent_reviews DROP COLUMN IF EXISTS reviewer_mobile;
