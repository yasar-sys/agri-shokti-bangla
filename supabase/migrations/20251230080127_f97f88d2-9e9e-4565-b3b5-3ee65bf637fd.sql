-- Create table for field zones with NDVI data
CREATE TABLE public.field_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  health_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (health_score >= 0 AND health_score <= 1),
  status TEXT NOT NULL DEFAULT 'unknown',
  status_bn TEXT NOT NULL DEFAULT 'অজানা',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  area_acres DECIMAL(10,2),
  last_scan_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ndvi_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for drone routes
CREATE TABLE public.drone_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_zone_id UUID REFERENCES public.field_zones(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  task_bn TEXT NOT NULL,
  area_acres DECIMAL(10,2) NOT NULL,
  estimated_time_mins INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  status_bn TEXT NOT NULL DEFAULT 'অপেক্ষমাণ',
  priority INTEGER DEFAULT 1,
  waypoints JSONB DEFAULT '[]',
  optimized_path JSONB DEFAULT '[]',
  spray_type TEXT,
  coverage_percentage DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for NDVI scan history
CREATE TABLE public.ndvi_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_zone_id UUID REFERENCES public.field_zones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  health_score DECIMAL(3,2) NOT NULL,
  vegetation_index DECIMAL(5,4),
  moisture_level DECIMAL(3,2),
  stress_level DECIMAL(3,2),
  raw_data JSONB DEFAULT '{}',
  scan_source TEXT DEFAULT 'satellite',
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.field_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for field_zones
CREATE POLICY "Users can view their own field zones" ON public.field_zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own field zones" ON public.field_zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own field zones" ON public.field_zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own field zones" ON public.field_zones FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for drone_routes
CREATE POLICY "Users can view their own drone routes" ON public.drone_routes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own drone routes" ON public.drone_routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drone routes" ON public.drone_routes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drone routes" ON public.drone_routes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ndvi_scans
CREATE POLICY "Users can view their own NDVI scans" ON public.ndvi_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own NDVI scans" ON public.ndvi_scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_field_zones_user_id ON public.field_zones(user_id);
CREATE INDEX idx_drone_routes_user_id ON public.drone_routes(user_id);
CREATE INDEX idx_drone_routes_status ON public.drone_routes(status);
CREATE INDEX idx_ndvi_scans_field_zone_id ON public.ndvi_scans(field_zone_id);
CREATE INDEX idx_ndvi_scans_scanned_at ON public.ndvi_scans(scanned_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drone_routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ndvi_scans;

-- Trigger for updated_at
CREATE TRIGGER update_field_zones_updated_at BEFORE UPDATE ON public.field_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drone_routes_updated_at BEFORE UPDATE ON public.drone_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();