-- Add rate limiting function for lead creation
-- Limits users to 5 leads per day per target agent to prevent spam

-- Create a function to check lead rate limit
CREATE OR REPLACE FUNCTION public.check_lead_rate_limit(p_user_id uuid, p_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM public.leads 
    WHERE user_id = p_user_id 
      AND agent_id = p_agent_id
      AND created_at > (CURRENT_TIMESTAMP - INTERVAL '24 hours')
  ) < 5
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create leads for agents" ON public.leads;

-- Create a more restrictive policy with rate limiting
CREATE POLICY "Users can create leads with rate limiting"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  public.check_lead_rate_limit(auth.uid(), agent_id)
);