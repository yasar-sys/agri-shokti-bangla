-- Create table for crop storage management
CREATE TABLE public.crop_storage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'মণ',
  location TEXT NOT NULL,
  storage_type TEXT NOT NULL DEFAULT 'ঐতিহ্যবাহী',
  stored_date DATE NOT NULL DEFAULT CURRENT_DATE,
  condition TEXT NOT NULL DEFAULT 'good',
  moisture TEXT,
  temperature TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crop_storage ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own storage" 
ON public.crop_storage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own storage" 
ON public.crop_storage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage" 
ON public.crop_storage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage" 
ON public.crop_storage 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crop_storage_updated_at
BEFORE UPDATE ON public.crop_storage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();