-- Create table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  device_info JSONB
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.push_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow anonymous subscriptions (for non-logged in users)
CREATE POLICY "Allow anonymous subscriptions insert"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous subscriptions select by endpoint"
ON public.push_subscriptions
FOR SELECT
USING (user_id IS NULL);

-- Create index for faster lookups
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id) WHERE user_id IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();