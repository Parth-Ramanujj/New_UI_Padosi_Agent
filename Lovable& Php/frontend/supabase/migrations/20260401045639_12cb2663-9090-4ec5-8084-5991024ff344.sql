-- Fix 1: Revoke UPDATE on admin-only columns from authenticated role
REVOKE UPDATE (is_profile_approved, subscription_plan, subscription_expires_at, onboarded_by, pending_changes) ON public.agent_profiles FROM authenticated;

-- Also revoke commission_rate self-modification on distributor_profiles
REVOKE UPDATE (commission_rate) ON public.distributor_profiles FROM authenticated;