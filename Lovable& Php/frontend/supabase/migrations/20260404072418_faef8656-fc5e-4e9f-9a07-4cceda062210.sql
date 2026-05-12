-- Fix the overly permissive USING clause
DROP POLICY IF EXISTS "Subscribers can deactivate their own subscription" ON public.newsletter_subscribers;

CREATE POLICY "Subscribers can deactivate their own subscription"
ON public.newsletter_subscribers
FOR UPDATE
TO anon, authenticated
USING (is_active = true)
WITH CHECK (is_active = false);