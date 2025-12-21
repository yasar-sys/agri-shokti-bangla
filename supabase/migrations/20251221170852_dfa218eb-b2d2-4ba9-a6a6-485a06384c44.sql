-- Create community posts table for farmer success stories
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_location TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'story' CHECK (post_type IN ('story', 'tip', 'question', 'advice')),
  image_url TEXT,
  crop_type TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Q&A forum table
CREATE TABLE public.forum_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  is_ai_moderated BOOLEAN DEFAULT false,
  ai_suggested_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum answers table
CREATE TABLE public.forum_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.forum_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  is_ai_answer BOOLEAN DEFAULT false,
  is_expert_answer BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge base for RAG (BARI documents, farming practices, govt schemes)
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('bari_research', 'farming_practice', 'govt_scheme', 'pest_control', 'fertilizer', 'weather', 'market')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  region TEXT,
  crop_type TEXT,
  season TEXT,
  keywords TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create local experts table
CREATE TABLE public.local_experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  specialization TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_experts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for forum_questions
CREATE POLICY "Anyone can view questions" ON public.forum_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON public.forum_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.forum_questions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for forum_answers
CREATE POLICY "Anyone can view answers" ON public.forum_answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON public.forum_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.forum_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for knowledge_base (read-only for public)
CREATE POLICY "Anyone can view knowledge base" ON public.knowledge_base FOR SELECT USING (is_active = true);

-- RLS Policies for local_experts
CREATE POLICY "Anyone can view experts" ON public.local_experts FOR SELECT USING (true);
CREATE POLICY "Users can register as expert" ON public.local_experts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Experts can update own profile" ON public.local_experts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Insert initial knowledge base data (BARI documents, practices, schemes)
INSERT INTO public.knowledge_base (category, title, content, source, region, crop_type, keywords) VALUES
-- BARI Research
('bari_research', 'ধান চাষে সমন্বিত বালাই ব্যবস্থাপনা', 'ধানের প্রধান রোগ: ব্লাস্ট, পাতা পোড়া, খোলপোড়া। প্রতিকার: রোগ প্রতিরোধী জাত ব্যবহার (ব্রি ধান-২৮, ব্রি ধান-২৯), সুষম সার প্রয়োগ, আক্রান্ত গাছ পুড়িয়ে ফেলা, ট্রাইসাইক্লাজল ছত্রাকনাশক স্প্রে।', 'BARI', 'সারাদেশ', 'ধান', ARRAY['ধান', 'রোগ', 'ব্লাস্ট', 'পাতাপোড়া', 'ছত্রাকনাশক']),
('bari_research', 'টমেটোর ভাইরাস রোগ প্রতিরোধ', 'টমেটো পাতা কোঁকড়ানো ভাইরাস (TYLCV) প্রতিকার: সাদা মাছি দমন, আক্রান্ত গাছ উঠিয়ে পুড়িয়ে ফেলা, নিম তেল স্প্রে, রোগ প্রতিরোধী জাত ব্যবহার।', 'BARI', 'সারাদেশ', 'টমেটো', ARRAY['টমেটো', 'ভাইরাস', 'পাতাকোঁকড়ানো', 'সাদামাছি']),
('bari_research', 'আলুর লেইট ব্লাইট রোগ', 'লক্ষণ: পাতায় বাদামী দাগ, পচা গন্ধ। প্রতিকার: রিডোমিল গোল্ড ২ গ্রাম/লিটার পানিতে মিশিয়ে ৭ দিন পরপর স্প্রে। সুষম সার ব্যবহার, অতিরিক্ত সেচ এড়িয়ে চলুন।', 'BARI', 'সারাদেশ', 'আলু', ARRAY['আলু', 'লেইটব্লাইট', 'ছত্রাক', 'রিডোমিল']),

-- Farming Practices
('farming_practice', 'জৈব সার তৈরির পদ্ধতি', 'কম্পোস্ট সার: গোবর ৪০%, খড়কুটা ৩০%, সবজি বর্জ্য ২০%, মাটি ১০%। ৩ মাস পচান, মাঝে মাঝে উলটে দিন। ভার্মিকম্পোস্ট: কেঁচো দিয়ে ৪৫ দিনে তৈরি, বেশি পুষ্টি সমৃদ্ধ।', 'কৃষি সম্প্রসারণ', 'সারাদেশ', NULL, ARRAY['জৈবসার', 'কম্পোস্ট', 'ভার্মিকম্পোস্ট', 'গোবর']),
('farming_practice', 'সবজি চাষে মালচিং', 'সুবিধা: মাটির আর্দ্রতা রক্ষা, আগাছা দমন, তাপমাত্রা নিয়ন্ত্রণ। পদ্ধতি: শুকনো পাতা, খড়, প্লাস্টিক মালচ ব্যবহার করুন। শীতকালীন সবজিতে বিশেষ কার্যকর।', 'কৃষি সম্প্রসারণ', 'সারাদেশ', 'সবজি', ARRAY['মালচিং', 'সবজি', 'আর্দ্রতা', 'আগাছা']),
('farming_practice', 'ফসল পর্যায় (Crop Rotation)', 'ধান-পাট-সবজি বা ধান-গম-সবজি পর্যায় অনুসরণ করুন। এতে মাটির উর্বরতা বাড়ে, রোগ-পোকা কম হয়, উৎপাদন খরচ কমে।', 'কৃষি সম্প্রসারণ', 'সারাদেশ', NULL, ARRAY['ফসলপর্যায়', 'মাটিউর্বরতা', 'ধান', 'গম']),

-- Government Schemes
('govt_scheme', 'কৃষি ভর্তুকি কার্ড', 'সুবিধা: সার, বীজ, কীটনাশকে ৫০% পর্যন্ত ছাড়। আবেদন: উপজেলা কৃষি অফিসে NID নিয়ে যোগাযোগ করুন। অনলাইন: dae.gov.bd', 'কৃষি মন্ত্রণালয়', 'সারাদেশ', NULL, ARRAY['ভর্তুকি', 'কার্ড', 'সার', 'বীজ']),
('govt_scheme', 'কৃষি ঋণ - বাংলাদেশ কৃষি ব্যাংক', 'ঋণের পরিমাণ: ৫০,০০০ থেকে ৫ লক্ষ টাকা। সুদের হার: ৪-৯%। প্রয়োজনীয় কাগজ: NID, জমির দলিল, ফসল পরিকল্পনা। যোগাযোগ: নিকটস্থ কৃষি ব্যাংক শাখা।', 'কৃষি ব্যাংক', 'সারাদেশ', NULL, ARRAY['ঋণ', 'ব্যাংক', 'কৃষিঋণ', 'সুদ']),
('govt_scheme', 'প্রধানমন্ত্রীর কৃষি প্রণোদনা', '১০ টাকায় ব্যাংক অ্যাকাউন্ট, বিনামূল্যে বীজ বিতরণ, প্রাকৃতিক দুর্যোগে ক্ষতিপূরণ। আবেদন: ইউনিয়ন পরিষদ বা উপজেলা কৃষি অফিস।', 'প্রধানমন্ত্রীর কার্যালয়', 'সারাদেশ', NULL, ARRAY['প্রণোদনা', 'বীজ', 'ক্ষতিপূরণ', 'দুর্যোগ']),

-- Pest Control
('pest_control', 'মাজরা পোকা দমন', 'লক্ষণ: ধানের শীষ সাদা হয়ে যায় (ডেড হার্ট)। প্রতিকার: আলোক ফাঁদ ব্যবহার, ডায়াজিনন ৬০ ইসি ২ মিলি/লিটার পানিতে স্প্রে, পার্চিং।', 'BARI', 'সারাদেশ', 'ধান', ARRAY['মাজরাপোকা', 'ধান', 'ডেডহার্ট', 'কীটনাশক']),
('pest_control', 'ফলের মাছি পোকা দমন', 'আম, পেয়ারা, কুলে আক্রমণ করে। প্রতিকার: ফেরোমন ফাঁদ, বিষটোপ (১০০ গ্রাম পাকা মিষ্টি কুমড়া + ১ মিলি ম্যালাথিয়ন), আক্রান্ত ফল সংগ্রহ করে মাটিতে পুঁতে ফেলুন।', 'BARI', 'সারাদেশ', 'আম', ARRAY['মাছিপোকা', 'আম', 'ফেরোমন', 'বিষটোপ']),

-- Fertilizer
('fertilizer', 'ধানের সার প্রয়োগ মাত্রা', 'বিঘা প্রতি: ইউরিয়া ২৫-৩০ কেজি (৩ কিস্তিতে), TSP ১৫ কেজি, MoP ১২ কেজি, জিপসাম ১০ কেজি। জমি তৈরির সময় TSP, MoP, জিপসাম দিন। ইউরিয়া রোপণের ১৫, ৩০, ৪৫ দিন পর।', 'BRRI', 'সারাদেশ', 'ধান', ARRAY['সার', 'ধান', 'ইউরিয়া', 'NPK']),
('fertilizer', 'সবজিতে জৈব ও রাসায়নিক সার', 'বিঘা প্রতি: গোবর ৫০০ কেজি + ইউরিয়া ২০ কেজি + TSP ২৫ কেজি + MoP ১৫ কেজি। জৈব সার জমি তৈরির ১৫ দিন আগে দিন।', 'কৃষি সম্প্রসারণ', 'সারাদেশ', 'সবজি', ARRAY['সার', 'সবজি', 'জৈবসার', 'গোবর']);

-- Insert sample success stories
INSERT INTO public.community_posts (author_name, author_location, title, content, post_type, crop_type, is_verified, is_featured) VALUES
('আব্দুল করিম', 'ময়মনসিংহ', 'জৈব সার দিয়ে ধানের ফলন দ্বিগুণ', 'গত বছর থেকে সম্পূর্ণ জৈব সার ব্যবহার করছি। প্রথম বছর ফলন একটু কম হলেও এবার বিঘায় ১৮ মণ ধান পেয়েছি। মাটির স্বাস্থ্য অনেক ভালো হয়েছে, রোগ-পোকার আক্রমণও কমেছে।', 'story', 'ধান', true, true),
('ফাতেমা বেগম', 'রাজশাহী', 'agriশক্তি অ্যাপে রোগ শনাক্ত করে ফসল বাঁচালাম', 'আমার টমেটো ক্ষেতে অজানা রোগ দেখা দিলে এই অ্যাপে ছবি তুলে দিলাম। AI বলল এটা Early Blight এবং কীভাবে সমাধান করতে হবে জানাল। সময়মতো ব্যবস্থা নেওয়ায় ৮০% ফসল বাঁচাতে পেরেছি।', 'story', 'টমেটো', true, true),
('মো. রফিক উদ্দিন', 'কুমিল্লা', 'সরকারি ভর্তুকি পেয়ে লাভজনক চাষ', 'কৃষি ভর্তুকি কার্ডের মাধ্যমে ৫০% ছাড়ে সার কিনেছি এবং কৃষি ঋণ নিয়ে পাম্প কিনেছি। এখন সেচ খরচ অনেক কম, লাভ বেশি।', 'tip', NULL, true, false);

-- Insert sample questions
INSERT INTO public.forum_questions (author_name, title, content, category, tags) VALUES
('মো. সাইফুল', 'ধানের পাতা হলুদ হয়ে যাচ্ছে কেন?', 'আমার আমন ধানের পাতা হলুদ হয়ে যাচ্ছে। কী করব? জমিতে পানি আছে।', 'disease', ARRAY['ধান', 'পাতাহলুদ', 'রোগ']),
('রহিমা খাতুন', 'টমেটোতে ফুল ঝরে যাচ্ছে', 'টমেটো গাছে অনেক ফুল আসছে কিন্তু বেশিরভাগ ঝরে যাচ্ছে। কী সমস্যা হতে পারে?', 'problem', ARRAY['টমেটো', 'ফুলঝরা']);

-- Insert sample experts
INSERT INTO public.local_experts (name, phone, location, specialization, experience_years, is_verified) VALUES
('ড. আবু হেনা মোস্তফা', '01712345678', 'ঢাকা', ARRAY['ধান', 'গম', 'রোগ নির্ণয়'], 25, true),
('মো. শফিকুল ইসলাম', '01812345678', 'রাজশাহী', ARRAY['আম', 'লিচু', 'ফল চাষ'], 15, true),
('আফসানা জাহান', '01912345678', 'ময়মনসিংহ', ARRAY['সবজি', 'জৈব চাষ', 'মালচিং'], 10, true);