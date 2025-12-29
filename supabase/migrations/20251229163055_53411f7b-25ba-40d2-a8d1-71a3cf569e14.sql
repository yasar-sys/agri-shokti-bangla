-- Create crop_listings table for barter marketplace
CREATE TABLE public.crop_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'কেজি',
  quality_grade TEXT DEFAULT 'ভালো',
  description TEXT,
  location TEXT,
  image_url TEXT,
  wanted_crops TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trade_requests table for barter transactions
CREATE TABLE public.trade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  offered_crop TEXT NOT NULL,
  offered_quantity DECIMAL NOT NULL,
  offered_unit TEXT NOT NULL DEFAULT 'কেজি',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requester_name TEXT,
  requester_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_listings
CREATE POLICY "Anyone can view available crop listings" 
ON public.crop_listings 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can create their own crop listings" 
ON public.crop_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop listings" 
ON public.crop_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop listings" 
ON public.crop_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for trade_requests
CREATE POLICY "Users can view trade requests for their listings or their own requests" 
ON public.trade_requests 
FOR SELECT 
USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT user_id FROM public.crop_listings WHERE id = listing_id)
);

CREATE POLICY "Users can create trade requests" 
ON public.trade_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Listing owners can update trade request status" 
ON public.trade_requests 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.crop_listings WHERE id = listing_id));

-- Create indexes for better performance
CREATE INDEX idx_crop_listings_user_id ON public.crop_listings(user_id);
CREATE INDEX idx_crop_listings_crop_name ON public.crop_listings(crop_name);
CREATE INDEX idx_crop_listings_available ON public.crop_listings(is_available);
CREATE INDEX idx_trade_requests_listing_id ON public.trade_requests(listing_id);
CREATE INDEX idx_trade_requests_requester_id ON public.trade_requests(requester_id);
CREATE INDEX idx_trade_requests_status ON public.trade_requests(status);

-- Create trigger for updating timestamps
CREATE TRIGGER update_crop_listings_updated_at
BEFORE UPDATE ON public.crop_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_requests_updated_at
BEFORE UPDATE ON public.trade_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();