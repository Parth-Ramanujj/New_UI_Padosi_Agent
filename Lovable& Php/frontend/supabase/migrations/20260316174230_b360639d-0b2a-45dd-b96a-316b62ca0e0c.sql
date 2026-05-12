-- Create notifications table for in-app notifications
CREATE TABLE public.agent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'lead',
  title text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;

-- Agents can view their own notifications
CREATE POLICY "Agents can view own notifications"
ON public.agent_notifications FOR SELECT
TO authenticated
USING (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));

-- Agents can update (mark as read) their own notifications
CREATE POLICY "Agents can update own notifications"
ON public.agent_notifications FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id AND has_role(auth.uid(), 'agent'::app_role));

-- Service role inserts (from edge function) - allow insert for any authenticated or via service role
CREATE POLICY "System can insert notifications"
ON public.agent_notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_notifications;