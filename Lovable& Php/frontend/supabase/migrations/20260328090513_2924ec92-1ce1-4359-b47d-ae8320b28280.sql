
-- Tighten newsletter_subscribers INSERT: require valid email format instead of allowing anything
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND length(trim(email)) > 5 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);
