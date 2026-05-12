-- Create agent_gallery_images table for storing agent gallery images
CREATE TABLE public.agent_gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for agent gallery images
CREATE POLICY "Agents can view their own gallery images" 
ON public.agent_gallery_images 
FOR SELECT 
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own gallery images" 
ON public.agent_gallery_images 
FOR INSERT 
WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own gallery images" 
ON public.agent_gallery_images 
FOR UPDATE 
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own gallery images" 
ON public.agent_gallery_images 
FOR DELETE 
USING (auth.uid() = agent_id);

-- Create policy for public viewing of agent gallery
CREATE POLICY "Anyone can view agent gallery images" 
ON public.agent_gallery_images 
FOR SELECT 
USING (true);

-- Create storage bucket for agent gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-gallery', 'agent-gallery', true);

-- Create storage policies for agent gallery uploads
CREATE POLICY "Agents can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agent-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Agents can update their gallery images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agent-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Agents can delete their gallery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agent-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agent-gallery');