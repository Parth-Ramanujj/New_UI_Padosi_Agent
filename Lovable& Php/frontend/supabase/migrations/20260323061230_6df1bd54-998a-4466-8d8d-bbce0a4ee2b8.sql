CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Assign default role based on user metadata, NEVER allow admin self-assignment
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE(
          CASE WHEN (NEW.raw_user_meta_data->>'role') IN ('user','agent','distributor')
            THEN (NEW.raw_user_meta_data->>'role')::app_role
            ELSE 'user'::app_role
          END,
          'user'::app_role
        )
    );
    
    -- If agent role, create agent profile
    IF (NEW.raw_user_meta_data->>'role') = 'agent' THEN
        INSERT INTO public.agent_profiles (id, subscription_plan)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'starter'));
    END IF;
    
    -- If distributor role, create distributor profile
    IF (NEW.raw_user_meta_data->>'role') = 'distributor' THEN
        INSERT INTO public.distributor_profiles (id, company_name)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
    END IF;
    
    RETURN NEW;
END;
$function$;