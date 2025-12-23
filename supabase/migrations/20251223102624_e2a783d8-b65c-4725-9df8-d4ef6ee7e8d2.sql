-- Create market_prices table for real-time market data
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  crop_emoji TEXT DEFAULT '🌾',
  today_price NUMERIC NOT NULL,
  yesterday_price NUMERIC NOT NULL,
  weekly_avg NUMERIC,
  unit TEXT DEFAULT 'টাকা/কেজি',
  market_location TEXT DEFAULT 'ঢাকা',
  forecast TEXT CHECK (forecast IN ('up', 'down', 'stable')),
  forecast_price NUMERIC,
  confidence INTEGER DEFAULT 70,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_alerts table for climate warnings
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  advice TEXT,
  region TEXT DEFAULT 'সারাদেশ',
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government_schemes table
CREATE TABLE public.government_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('subsidy', 'loan', 'insurance', 'training', 'equipment')) DEFAULT 'subsidy',
  eligibility TEXT,
  benefits TEXT,
  application_link TEXT,
  contact_phone TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table for community likes tracking
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table for community comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_expert_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table for gamification
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Create farming_tips table for daily tips
CREATE TABLE public.farming_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  season TEXT,
  crop_type TEXT,
  is_active BOOLEAN DEFAULT true,
  display_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_prices (public read)
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT USING (true);

-- RLS Policies for weather_alerts (public read)
CREATE POLICY "Anyone can view active weather alerts" ON public.weather_alerts FOR SELECT USING (is_active = true);

-- RLS Policies for government_schemes (public read)
CREATE POLICY "Anyone can view active schemes" ON public.government_schemes FOR SELECT USING (is_active = true);

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for farming_tips (public read)
CREATE POLICY "Anyone can view active tips" ON public.farming_tips FOR SELECT USING (is_active = true);

-- Enable realtime for community features
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- Insert seed data for market prices
INSERT INTO public.market_prices (crop_name, crop_emoji, today_price, yesterday_price, weekly_avg, forecast, forecast_price, confidence) VALUES
('ধান (আমন)', '🌾', 1250, 1200, 1220, 'up', 1320, 78),
('ধান (বোরো)', '🌾', 1180, 1190, 1175, 'stable', 1185, 82),
('গম', '🌿', 1450, 1420, 1400, 'up', 1520, 71),
('পাট', '🧵', 2800, 2750, 2700, 'up', 2950, 85),
('আলু', '🥔', 25, 28, 27, 'down', 22, 76),
('পেঁয়াজ', '🧅', 45, 42, 40, 'up', 52, 68),
('রসুন', '🧄', 180, 175, 172, 'stable', 182, 80),
('মরিচ', '🌶️', 250, 260, 255, 'down', 235, 73),
('টমেটো', '🍅', 35, 32, 33, 'up', 40, 65),
('বেগুন', '🍆', 28, 30, 29, 'down', 25, 72);

-- Insert seed data for weather alerts
INSERT INTO public.weather_alerts (alert_type, severity, title, message, advice, region) VALUES
('heat_wave', 'high', 'তাপপ্রবাহ সতর্কতা', 'আগামী ৩ দিন তাপমাত্রা ৩৮°+ থাকবে', 'সকাল ১০টার পর সেচ দেবেন না। চারা ঢেকে রাখুন।', 'উত্তরবঙ্গ'),
('drought', 'medium', 'খরা ঝুঁকি', 'আগামী ১০ দিন বৃষ্টির সম্ভাবনা কম', 'পানি সংরক্ষণ করুন। মালচিং ব্যবহার করুন।', 'রাজশাহী বিভাগ');

-- Insert seed data for government schemes
INSERT INTO public.government_schemes (title, description, category, eligibility, benefits, contact_phone) VALUES
('কৃষি উপকরণ ভর্তুকি', 'সার, বীজ, কীটনাশকে সরকারি ভর্তুকি', 'subsidy', 'সকল কৃষক', '১০-৫০% ভর্তুকি', '16123'),
('কৃষি কার্ড প্রকল্প', 'সার ক্রয়ে ১০ টাকা/কেজি ভর্তুকি', 'subsidy', 'কৃষি কার্ডধারী', 'প্রতি কেজিতে ১০ টাকা ছাড়', '16123'),
('কৃষি যান্ত্রিকীকরণ', 'কৃষি যন্ত্রপাতিতে ৫০-৭০% ভর্তুকি', 'equipment', 'ক্ষুদ্র ও প্রান্তিক কৃষক', '৫০-৭০% ভর্তুকি', '09612-000000'),
('কৃষি ঋণ', '৪% সুদে কৃষি ঋণ, সর্বোচ্চ ৫ লাখ টাকা', 'loan', 'জমির মালিক কৃষক', 'কম সুদে ঋণ সুবিধা', '16236'),
('শস্য বীমা প্রকল্প', 'প্রাকৃতিক দুর্যোগে ক্ষতিপূরণ', 'insurance', 'নিবন্ধিত কৃষক', '৮০% ক্ষতিপূরণ', '09666-000000');

-- Insert seed data for farming tips
INSERT INTO public.farming_tips (tip_text, category, season, crop_type) VALUES
('সকালে সেচ দিলে পানির অপচয় কম হয় এবং ফসল বেশি পানি পায়।', 'irrigation', 'all', NULL),
('ইউরিয়া সার সন্ধ্যার পর প্রয়োগ করলে ভালো কাজ করে।', 'fertilizer', 'all', NULL),
('ধান রোপণের ২০-২৫ দিন পর প্রথম আগাছা নিড়ানি দিন।', 'weeding', 'monsoon', 'ধান'),
('পোকার আক্রমণ রোধে নিয়মিত জমি পরিদর্শন করুন।', 'pest_control', 'all', NULL),
('জৈব সার ব্যবহারে মাটির উর্বরতা বাড়ে এবং খরচ কমে।', 'fertilizer', 'all', NULL);

-- Function to increment likes count on community_posts
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for likes count
CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_likes_count();

CREATE TRIGGER on_like_delete
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_likes_count();

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_comments_count();