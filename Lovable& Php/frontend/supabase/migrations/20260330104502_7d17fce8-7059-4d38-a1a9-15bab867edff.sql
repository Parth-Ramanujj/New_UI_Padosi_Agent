-- Fix: Remove agent_notifications from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_notifications;