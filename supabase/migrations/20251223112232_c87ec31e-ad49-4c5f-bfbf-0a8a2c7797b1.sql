-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursion)
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

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics_events table for tracking feature usage
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics"
ON public.analytics_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to get feature usage stats (admin only)
CREATE OR REPLACE FUNCTION public.get_feature_stats()
RETURNS TABLE (
    feature_name TEXT,
    usage_count BIGINT,
    unique_users BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    event_name as feature_name,
    COUNT(*) as usage_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM public.analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY event_name
  ORDER BY usage_count DESC
$$;

-- Create function to get disease trends (admin only)
CREATE OR REPLACE FUNCTION public.get_disease_trends()
RETURNS TABLE (
    disease TEXT,
    case_count BIGINT,
    latest_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    disease_name as disease,
    COUNT(*) as case_count,
    MAX(created_at::date) as latest_date
  FROM public.scan_history
  WHERE disease_name IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY disease_name
  ORDER BY case_count DESC
$$;

-- Create function to get user engagement stats
CREATE OR REPLACE FUNCTION public.get_engagement_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_users_today BIGINT,
    active_users_week BIGINT,
    total_scans BIGINT,
    total_posts BIGINT,
    total_chat_messages BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE created_at >= CURRENT_DATE) as active_users_today,
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_week,
    (SELECT COUNT(*) FROM public.scan_history) as total_scans,
    (SELECT COUNT(*) FROM public.community_posts) as total_posts,
    (SELECT COUNT(*) FROM public.chat_messages) as total_chat_messages
$$;