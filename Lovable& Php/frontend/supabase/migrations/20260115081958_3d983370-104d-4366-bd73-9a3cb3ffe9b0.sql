-- Fix search_path for check_review_limit function
CREATE OR REPLACE FUNCTION check_review_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.agent_reviews 
        WHERE user_id = NEW.user_id AND agent_id = NEW.agent_id) >= 3 THEN
        RAISE EXCEPTION 'Maximum 3 reviews per agent allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop the overly permissive analytics policies and replace with proper ones
DROP POLICY IF EXISTS "System can insert analytics" ON public.agent_analytics;
DROP POLICY IF EXISTS "System can update analytics" ON public.agent_analytics;

-- Analytics should only be insertable/updatable for the agent's own records
CREATE POLICY "Agents can insert their own analytics"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own analytics"
ON public.agent_analytics
FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id);