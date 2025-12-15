
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  blood_group TEXT,
  nationality TEXT DEFAULT 'বাংলাদেশী',
  phone TEXT,
  total_scans INTEGER DEFAULT 0,
  diseases_detected INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 1,
  xp_points INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'নতুন কৃষক',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, blood_group, nationality)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'blood_group',
    COALESCE(NEW.raw_user_meta_data ->> 'nationality', 'বাংলাদেশী')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create user_calendars table to save farming calendars
CREATE TABLE public.user_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_name TEXT NOT NULL,
  land_size DECIMAL NOT NULL,
  tasks JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendars"
ON public.user_calendars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendars"
ON public.user_calendars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars"
ON public.user_calendars FOR DELETE
USING (auth.uid() = user_id);

-- Create user_lands table for land records
CREATE TABLE public.user_lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  land_name TEXT NOT NULL,
  land_size DECIMAL NOT NULL,
  land_type TEXT,
  is_registered BOOLEAN DEFAULT false,
  registry_number TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_lands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lands"
ON public.user_lands FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lands"
ON public.user_lands FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lands"
ON public.user_lands FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lands"
ON public.user_lands FOR DELETE
USING (auth.uid() = user_id);

-- Update scan_history to link with user
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Function to update user stats after scan
CREATE OR REPLACE FUNCTION public.update_user_scan_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_scans = total_scans + 1,
    diseases_detected = CASE WHEN NEW.disease_name IS NOT NULL THEN diseases_detected + 1 ELSE diseases_detected END,
    xp_points = xp_points + 10,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_scan_created
  AFTER INSERT ON public.scan_history
  FOR EACH ROW 
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION public.update_user_scan_stats();
