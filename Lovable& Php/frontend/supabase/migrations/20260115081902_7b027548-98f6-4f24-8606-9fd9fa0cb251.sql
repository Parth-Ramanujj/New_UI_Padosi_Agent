-- Create role enum for the 3 user types
CREATE TYPE public.app_role AS ENUM ('user', 'agent', 'distributor', 'admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create profiles table for all users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Public profiles can be viewed by anyone (for agent listings)
CREATE POLICY "Public can view profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Create agent_profiles table with extended info
CREATE TABLE public.agent_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    license_number TEXT,
    location TEXT,
    bio TEXT,
    specializations TEXT[],
    years_experience INTEGER DEFAULT 0,
    subscription_plan TEXT DEFAULT 'starter',
    subscription_expires_at TIMESTAMPTZ,
    is_profile_approved BOOLEAN DEFAULT false,
    pending_changes JSONB,
    onboarded_by UUID REFERENCES auth.users(id),
    cover_page TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on agent_profiles
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_profiles
CREATE POLICY "Agents can view their own agent profile"
ON public.agent_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Agents can update their own agent profile"
ON public.agent_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can insert their own agent profile"
ON public.agent_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Public can view approved agent profiles"
ON public.agent_profiles
FOR SELECT
TO anon
USING (is_profile_approved = true);

-- Create leads table for agents
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    product_interest TEXT,
    location TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Agents can view their own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = agent_id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = agent_id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can update their own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can delete their own leads"
ON public.leads
FOR DELETE
TO authenticated
USING (auth.uid() = agent_id AND public.has_role(auth.uid(), 'agent'));

-- Users can create leads (when contacting agents)
CREATE POLICY "Authenticated users can create leads for agents"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create agent_analytics table
CREATE TABLE public.agent_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_views INTEGER DEFAULT 0,
    profile_clicks INTEGER DEFAULT 0,
    contact_requests INTEGER DEFAULT 0,
    date DATE NOT NULL,
    UNIQUE(agent_id, date)
);

-- Enable RLS on agent_analytics
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_analytics
CREATE POLICY "Agents can view their own analytics"
ON public.agent_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = agent_id AND public.has_role(auth.uid(), 'agent'));

CREATE POLICY "System can insert analytics"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update analytics"
ON public.agent_analytics
FOR UPDATE
TO authenticated
USING (true);

-- Create agent_reviews table
CREATE TABLE public.agent_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on agent_reviews
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.agent_reviews
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create reviews"
ON public.agent_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'user'));

CREATE POLICY "Users can update their own reviews"
ON public.agent_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Function to enforce 3-review limit per agent per user
CREATE OR REPLACE FUNCTION check_review_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.agent_reviews 
        WHERE user_id = NEW.user_id AND agent_id = NEW.agent_id) >= 3 THEN
        RAISE EXCEPTION 'Maximum 3 reviews per agent allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce review limit
CREATE TRIGGER enforce_review_limit
    BEFORE INSERT ON public.agent_reviews
    FOR EACH ROW EXECUTE FUNCTION check_review_limit();

-- Create user_activity_log table (for anti-scraping and spam control)
CREATE TABLE public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_activity_log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity_log
CREATE POLICY "Users can view their own activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create distributor_profiles table
CREATE TABLE public.distributor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    region TEXT,
    target_agents INTEGER DEFAULT 0,
    commission_rate NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on distributor_profiles
ALTER TABLE public.distributor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributor_profiles
CREATE POLICY "Distributors can view their own profile"
ON public.distributor_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id AND public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can update their own profile"
ON public.distributor_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can insert their own profile"
ON public.distributor_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND public.has_role(auth.uid(), 'distributor'));

-- Create distributor_agents table (track onboarded agents)
CREATE TABLE public.distributor_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    onboarded_at TIMESTAMPTZ DEFAULT now(),
    referral_code TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    UNIQUE(distributor_id, agent_id)
);

-- Enable RLS on distributor_agents
ALTER TABLE public.distributor_agents ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributor_agents
CREATE POLICY "Distributors can view their onboarded agents"
ON public.distributor_agents
FOR SELECT
TO authenticated
USING (auth.uid() = distributor_id AND public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can insert agent relationships"
ON public.distributor_agents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = distributor_id AND public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can update their agent relationships"
ON public.distributor_agents
FOR UPDATE
TO authenticated
USING (auth.uid() = distributor_id AND public.has_role(auth.uid(), 'distributor'));

-- Create renewal_reminders table
CREATE TABLE public.renewal_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'whatsapp')),
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'sent'
);

-- Enable RLS on renewal_reminders
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for renewal_reminders
CREATE POLICY "Distributors can view their reminders"
ON public.renewal_reminders
FOR SELECT
TO authenticated
USING (auth.uid() = distributor_id AND public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can insert reminders"
ON public.renewal_reminders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = distributor_id AND public.has_role(auth.uid(), 'distributor'));

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Assign default role based on user metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user')
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers for tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON public.agent_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distributor_profiles_updated_at
    BEFORE UPDATE ON public.distributor_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();