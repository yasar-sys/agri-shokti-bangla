-- Create table for pest reports from farmers
CREATE TABLE public.pest_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT,
  pest_name TEXT NOT NULL,
  pest_name_bn TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  temperature NUMERIC,
  humidity NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pest_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pest reports" 
ON public.pest_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create pest reports" 
ON public.pest_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own reports" 
ON public.pest_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable realtime for pest reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.pest_reports;

-- Create index for faster queries
CREATE INDEX idx_pest_reports_district ON public.pest_reports(district);
CREATE INDEX idx_pest_reports_created_at ON public.pest_reports(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_pest_reports_updated_at
BEFORE UPDATE ON public.pest_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();