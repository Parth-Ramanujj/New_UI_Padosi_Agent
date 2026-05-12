-- Add length constraints to prevent DoS via large inputs
-- Using validation triggers instead of CHECK constraints for better error handling

-- Add constraint for agent_reviews comment length
ALTER TABLE public.agent_reviews 
  ADD CONSTRAINT agent_reviews_comment_length 
  CHECK (comment IS NULL OR length(comment) <= 500);

-- Add constraint for leads notes length
ALTER TABLE public.leads 
  ADD CONSTRAINT leads_notes_length 
  CHECK (notes IS NULL OR length(notes) <= 1000);

-- Add constraint for leads name length
ALTER TABLE public.leads 
  ADD CONSTRAINT leads_name_length 
  CHECK (length(name) <= 100);

-- Add constraint for leads email length
ALTER TABLE public.leads 
  ADD CONSTRAINT leads_email_length 
  CHECK (email IS NULL OR length(email) <= 255);

-- Add constraint for leads phone length  
ALTER TABLE public.leads 
  ADD CONSTRAINT leads_phone_length 
  CHECK (phone IS NULL OR length(phone) <= 20);

-- Add constraint for agent_profiles bio length
ALTER TABLE public.agent_profiles 
  ADD CONSTRAINT agent_profiles_bio_length 
  CHECK (bio IS NULL OR length(bio) <= 2000);