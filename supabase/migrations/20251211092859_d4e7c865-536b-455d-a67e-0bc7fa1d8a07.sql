-- Create chat_messages table to store conversation history
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('ai', 'user')),
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert messages (since no auth required for now)
CREATE POLICY "Anyone can read messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create scan_history table to store crop scan results
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  disease_name TEXT,
  health_score INTEGER DEFAULT 0,
  symptoms TEXT[],
  treatment TEXT,
  fertilizer_advice TEXT,
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert scans
CREATE POLICY "Anyone can read scans" 
ON public.scan_history 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert scans" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (true);