-- Isolate PAN into a dedicated sensitive table and remove from broadly-readable table

CREATE TABLE IF NOT EXISTS public.agent_sensitive_details (
  agent_id uuid PRIMARY KEY,
  pan_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_sensitive_details ENABLE ROW LEVEL SECURITY;

-- Keep timestamp in sync
DROP TRIGGER IF EXISTS update_agent_sensitive_details_updated_at ON public.agent_sensitive_details;
CREATE TRIGGER update_agent_sensitive_details_updated_at
BEFORE UPDATE ON public.agent_sensitive_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: agent owns row, admins can manage all
DROP POLICY IF EXISTS "Agents can view own sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Agents can view own sensitive details"
ON public.agent_sensitive_details
FOR SELECT
TO authenticated
USING ((auth.uid() = agent_id) AND has_role(auth.uid(), 'agent'::app_role));

DROP POLICY IF EXISTS "Agents can insert own sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Agents can insert own sensitive details"
ON public.agent_sensitive_details
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = agent_id) AND has_role(auth.uid(), 'agent'::app_role));

DROP POLICY IF EXISTS "Agents can update own sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Agents can update own sensitive details"
ON public.agent_sensitive_details
FOR UPDATE
TO authenticated
USING ((auth.uid() = agent_id) AND has_role(auth.uid(), 'agent'::app_role))
WITH CHECK ((auth.uid() = agent_id) AND has_role(auth.uid(), 'agent'::app_role));

DROP POLICY IF EXISTS "Admins can view all sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Admins can view all sensitive details"
ON public.agent_sensitive_details
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Admins can insert sensitive details"
ON public.agent_sensitive_details
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update sensitive details" ON public.agent_sensitive_details;
CREATE POLICY "Admins can update sensitive details"
ON public.agent_sensitive_details
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing PAN values into isolated table
INSERT INTO public.agent_sensitive_details (agent_id, pan_number)
SELECT id, pan_number
FROM public.agent_profiles
WHERE pan_number IS NOT NULL AND btrim(pan_number) <> ''
ON CONFLICT (agent_id) DO UPDATE
SET pan_number = EXCLUDED.pan_number,
    updated_at = now();

-- Remove PAN from agent_profiles to eliminate any chance of anon exposure
ALTER TABLE public.agent_profiles
DROP COLUMN IF EXISTS pan_number;