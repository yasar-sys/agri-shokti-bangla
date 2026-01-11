# 🌾 AgriShokti - AI-Powered Smart Agriculture Platform

> **An AI-Powered Agricultural Assistant for Bangladesh Farmers**
> 
> **Project Name:** AgriShokti (কৃষিশক্তি - "Agricultural Power")
> 
> Version: 1.0.0 | Last Updated: December 23, 2024

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Team Information & Credits](#2-team-information--credits)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Features](#5-features)
6. [Database Schema](#6-database-schema)
7. [Edge Functions (Backend API)](#7-edge-functions-backend-api)
8. [Frontend Structure](#8-frontend-structure)
9. [Authentication](#9-authentication)
10. [AI Capabilities](#10-ai-capabilities)
11. [PWA & Offline Support](#11-pwa--offline-support)
12. [Internationalization](#12-internationalization)
13. [Security](#13-security)
14. [Deployment](#14-deployment)
15. [API Reference](#15-api-reference)
16. [Future Vision & Goals](#16-future-vision--goals)
17. [References & Data Sources](#17-references--data-sources)
18. [Contributing](#18-contributing)

---

## 1. Project Overview

### What is AgriBrain AI?

AgriBrain AI (agriশক্তি) is a Progressive Web Application (PWA) designed to empower Bangladeshi farmers with AI-powered agricultural assistance. The app provides real-time crop disease detection, personalized farming advice, market prices, weather alerts, and community support—all in Bengali language.

### Key Value Propositions

- **AI-Powered Disease Detection**: Upload or capture crop images to instantly diagnose diseases
- **Personalized Farming Calendar**: Automated task scheduling based on crop type and land size
- **Real-Time Market Prices**: Current prices with weekly averages and AI forecasts
- **Weather Alerts**: Climate warnings with agricultural recommendations
- **Voice Interaction**: Bengali voice input and text-to-speech for accessibility
- **Offline Support**: Core features work without internet connectivity
- **Gamification**: XP points, achievements, and rankings to encourage engagement

### Target Users

- Small and medium-scale farmers in Bangladesh
- Agricultural extension workers
- Agricultural students and researchers
- Government agricultural officers

---

## 2. Team Information & Credits

### Project Name
**AgriShokti** (কৃষিশক্তি - "Agricultural Power")

### Team Name
**TEAM_NEWBIES**

### Team Lead & Prompt Engineer
**Samin Yasar**  
*Mymensingh Engineering College*  
Role: Team Lead, Prompt Engineering & AI Integration Specialist

### Team Members

| Name | Institution | Role |
|------|-------------|------|
| **Samin Yasar** | Mymensingh Engineering College | Team Lead, Prompt Engineer |
| **Rahiatul Jannat** | Mymensingh Engineering College | Developer |
| **Maisha Osman Umama** | Mymensingh Engineering College | Developer |
| **Neshat Sultana Keya** | Gazipur Agricultural University | Agricultural Expert |

### Special Credits

#### 🏆 Prompt Engineering & AI Development
**Samin Yasar** - As the Prompt Engineering Lead and primary deliverer of all AI prompts, Samin and his team was responsible for:

- ✅ Designing and optimizing all AI prompts for the platform
- ✅ Integrating Gemini AI for crop disease detection
- ✅ Developing the conversational AI chatbot (AgriBot)
- ✅ Creating the RAG (Retrieval-Augmented Generation) system for agricultural knowledge
- ✅ Optimizing AI responses for Bengali language support
- ✅ Building the complete frontend and backend architecture
- ✅ Database design and API integration
- ✅ Full-stack development and deployment


## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Shadcn/UI | Latest | Component Library |
| React Router | 6.30.1 | Routing |
| TanStack Query | 5.83.0 | Data Fetching |
| Recharts | 2.15.4 | Charts & Visualization |
| Mapbox GL | 3.17.0 | Maps |
| Framer Motion | - | Animations |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions (Deno) | Serverless Backend |
| Row Level Security (RLS) | Data Protection |

### AI Services

| Service | Model | Purpose |
|---------|-------|---------|
| Lovable AI Gateway | google/gemini-2.5-flash | Chat, RAG, Disease Detection |

### NASA Data Integration

| Service | Data Source | Purpose |
|---------|-------------|---------|
| NASA OpenET | Landsat, MODIS, Weather Stations | Evapotranspiration & Water Management |
| Crop-CASMA | SMAP, MODIS, GPM | Soil Moisture & Drought Monitoring |
| NASA POWER | GMAO GEOS-FP | Weather Forecasting & Climate Data |
| Earth Observation | Landsat-8/9, Sentinel-2, MODIS | Vegetation Indices & Crop Health |
| NASA GIBS | Multiple Satellites | Satellite Imagery & Visualization |
| AgroMonitoring | Sentinel-2, Landsat (+NDVI) | Real-time Crop Health Indices |

### DevOps & Infrastructure

- **Hosting**: Lovable Cloud
- **CI/CD**: Automatic deployment via Lovable
- **PWA**: Vite PWA Plugin
- **Version Control**: GitHub integration

## 3.1 Innovation Edge (The "10X" Features)

To distinguish AgriShokti from generic wrappers, we implemented two "Generation Leap" features:

### 🚀 1. Satellite-to-Ground-Truth Loop
A self-correcting feedback mechanism that bridges the gap between orbit and soil.
1.  **Sensing**: **Sentinel-2** satellite (via AgroMonitoring API) detects a sudden NDVI drop (Yellow Patch) in a specific coordinate.
2.  **Alerting**: The system proactively alerts the farmer: *"Possible stress detected in North corner. Please verify."*
3.  **Ground Truthing**: Farmer takes a photo of the crop.
4.  **Synthesis**: **Gemini 2.5 Flash** correlates the Satellite anomaly with the Visual symptom (e.g., "Nitrogen deficiency") to confirm the diagnosis.

### 🧩 2. "n8n-Style" Workflow Orchestration
We architected our backend not as a monolith, but as a node-based workflow using **Supabase Edge Functions**:
-   **Trigger Node**: Image Upload / Schedule.
-   **Vision Node**: `/detect-disease` (Gemini Vision).
-   **Logic Node**: `/rag-answer` (Vector Search against BARI PDFs).
-   **Action Node**: `/text-to-speech` (Bangla Voice Synthesis).
-   **Result**: A modular, maintainable, and verifiable decision chain.

---

## 3. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (PWA)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   React     │ │ TanStack    │ │  Tailwind   │ │   Mapbox   │ │
│  │  Components │ │   Query     │ │     CSS     │ │     GL     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE / LOVABLE CLOUD                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │    Auth     │ │  PostgreSQL │ │   Storage   │ │   Edge     │ │
│  │   Service   │ │   Database  │ │   Buckets   │ │  Functions │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Lovable AI    │  │     Mapbox      │  │  Weather API    │  │
│  │    Gateway      │  │      Maps       │  │  (OpenWeather)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → React Component → Custom Hook → Supabase Client → Database/Edge Function
                                    ↑                               ↓
                              State Update ←─────────── Response ←──┘
```

---

## 4. Features

### Core Features

#### 4.1 AI Chat Assistant
- Real-time conversation with AI agricultural expert
- Bengali language support
- Voice input capability
- Chat history persistence
- Text-to-speech for AI responses

#### 4.2 Crop Disease Detection
- Camera integration for image capture
- Image upload from gallery
- AI-powered disease analysis
- Detailed treatment recommendations
- Fertilizer and irrigation advice

#### 4.3 Market Prices
- Real-time crop prices
- Weekly averages
- AI price forecasts
- Price trend indicators
- Multiple market locations

#### 4.4 Weather & Climate Alerts
- Current weather conditions
- Weather forecasts
- Severe weather alerts
- Agricultural recommendations
- Region-based warnings

#### 4.5 Farming Calendar
- Personalized task scheduling
- Crop-specific activities
- Reminder notifications
- Database sync for logged-in users

#### 4.6 Community Forum
- Post questions and stories
- Like and comment system
- Expert verification badges
- AI-moderated content

#### 4.7 NASA Farm Navigators 🛰️
- **OpenET Integration**: Real-time evapotranspiration data for water management
- **Crop-CASMA**: Soil moisture analysis and drought monitoring
- **Earth Observation**: Landsat, MODIS, Sentinel-2 satellite data integration
- **NASA Weather**: POWER and GMAO weather forecasting for agriculture
- **NDVI Analysis**: Vegetation health monitoring and change detection
- **Water Balance**: Automated irrigation recommendations and water budgeting
- **Drought Alerts**: Early warning system for water stress conditions
- **Satellite Imagery**: Multi-spectral analysis for crop health assessment
- **AgroMonitoring**: Real-time polygon monitoring and historical NDVI data access

### Additional Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Fertilizer Scanner** | Detects fake fertilizer packaging via image analysis. | ✅ Live |
| **NPK Calculator** | Calculates exact urea/potash needs based on land size. | ✅ Live |
| **Land Calculator** | GPS and Map-based land area measurement. | ✅ Live |
| **Pest Map** | Heatmap of regional pest outbreaks reported by users. | ✅ Live |
| **Satellite View** | Raw satellite imagery view of the user's location. | ✅ Live |
| **Government Services** | Index of agricultural schemes and officer contacts. | ✅ Live |
| **Knowledge Base** | Searchable library of agricultural articles. | ✅ Live |
| **Profile & Gamification** | XP system, leaderboards, and user achievements. | ✅ Live |
| **Machine Optimizer** | Guide for agricultural machinery maintenance. | ✅ Live |
| **Impact Analytics** | Dashboard for tracking yield improvements. | ✅ Live |
| **Barter System** | Feature for exchanging agricultural tools/goods. | 🚧 Beta |
| **Storage Locator** | Find nearby cold storage facilities. | ✅ Live |

### 🎮 Demo Mode Features
*Designed for Judges and Offline Demonstration (accessed via `/demo`)*

1.  **Instant Disease Simulation**: Pre-loaded images of common Bangladeshi crop diseases to test the AI without needing a field trip.
2.  **Voice Interaction Demo**: One-click play buttons to demonstrate the Bangla Text-to-Speech engine.
3.  **Mock Satellite Feed**: Simulates a live crossover of Sentinel-2 data to demonstrate the "Satellite-to-Ground" alert loop.
4.  **Offline Capability Check**: Visual indicators to show which features remain active when the device disconnects from the internet.

---

## 5. Database Schema

### Tables Overview

#### User-Related Tables

```sql
-- profiles: User profile information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  blood_group TEXT,
  nationality TEXT DEFAULT 'বাংলাদেশী',
  total_scans INTEGER DEFAULT 0,
  diseases_detected INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'নতুন কৃষক',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_roles: Role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL, -- 'admin', 'moderator', 'user'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- user_settings: User preferences
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  language TEXT DEFAULT 'bn',
  theme TEXT DEFAULT 'dark',
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_achievements: Gamification
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- user_lands: Registered farmlands
CREATE TABLE public.user_lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  land_name TEXT NOT NULL,
  land_size NUMERIC NOT NULL,
  land_type TEXT,
  location TEXT,
  is_registered BOOLEAN DEFAULT false,
  registry_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_calendar_events: Farming calendar
CREATE TABLE public.user_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '09:00',
  event_type TEXT DEFAULT 'other',
  location TEXT,
  reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Content Tables

```sql
-- chat_messages: AI chat history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- scan_history: Disease detection history
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT NOT NULL,
  image_url TEXT,
  disease_name TEXT,
  health_score INTEGER DEFAULT 0,
  symptoms TEXT[],
  treatment TEXT,
  fertilizer_advice TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- community_posts: Forum posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_location TEXT,
  post_type TEXT DEFAULT 'story',
  crop_type TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- post_comments: Comments on posts
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  user_id UUID,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_expert_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- post_likes: Post like tracking
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Reference Data Tables

```sql
-- market_prices: Crop market prices
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  crop_emoji TEXT DEFAULT '🌾',
  today_price NUMERIC NOT NULL,
  yesterday_price NUMERIC NOT NULL,
  weekly_avg NUMERIC,
  forecast_price NUMERIC,
  forecast TEXT,
  confidence INTEGER DEFAULT 70,
  market_location TEXT DEFAULT 'ঢাকা',
  unit TEXT DEFAULT 'টাকা/কেজি',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- weather_alerts: Weather warnings
CREATE TABLE public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  region TEXT DEFAULT 'সারাদেশ',
  advice TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- knowledge_base: Agricultural articles
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  crop_type TEXT,
  season TEXT,
  region TEXT,
  keywords TEXT[],
  source TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- farming_tips: Daily tips
CREATE TABLE public.farming_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  crop_type TEXT,
  season TEXT,
  display_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- government_schemes: Government programs
CREATE TABLE public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'subsidy',
  eligibility TEXT,
  benefits TEXT,
  application_link TEXT,
  contact_phone TEXT,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- agriculture_contacts: Department contacts
CREATE TABLE public.agriculture_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name TEXT NOT NULL,
  officer_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- local_experts: Verified agricultural experts
CREATE TABLE public.local_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  specialization TEXT[],
  experience_years INTEGER DEFAULT 0,
  phone TEXT,
  rating NUMERIC DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Analytics Tables

```sql
-- analytics_events: Usage tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Database Functions

```sql
-- Check user role
CREATE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get engagement statistics (Admin only)
CREATE FUNCTION public.get_engagement_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users_today BIGINT,
  active_users_week BIGINT,
  total_scans BIGINT,
  total_posts BIGINT,
  total_chat_messages BIGINT
) AS $$
  SELECT 
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= CURRENT_DATE),
    (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM scan_history),
    (SELECT COUNT(*) FROM community_posts),
    (SELECT COUNT(*) FROM chat_messages)
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get feature usage statistics
CREATE FUNCTION public.get_feature_stats()
RETURNS TABLE (feature_name TEXT, usage_count BIGINT, unique_users BIGINT) AS $$
  SELECT event_name, COUNT(*), COUNT(DISTINCT user_id)
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY event_name ORDER BY COUNT(*) DESC
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get disease trends
CREATE FUNCTION public.get_disease_trends()
RETURNS TABLE (disease TEXT, case_count BIGINT, latest_date DATE) AS $$
  SELECT disease_name, COUNT(*), MAX(created_at::date)
  FROM scan_history
  WHERE disease_name IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY disease_name ORDER BY COUNT(*) DESC
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Auto-update profile on new scan
CREATE FUNCTION public.update_user_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET 
    total_scans = total_scans + 1,
    diseases_detected = CASE WHEN NEW.disease_name IS NOT NULL 
                        THEN diseases_detected + 1 ELSE diseases_detected END,
    xp_points = xp_points + 10,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

| Table | Policy | Access |
|-------|--------|--------|
| profiles | Own profile only | SELECT, INSERT, UPDATE |
| user_settings | Own settings only | SELECT, INSERT, UPDATE |
| user_calendar_events | Own events only | FULL CRUD |
| community_posts | Public read, own write | SELECT all, INSERT/UPDATE/DELETE own |
| analytics_events | Admin read, anyone insert | Admins can view, anyone can log |
| market_prices | Public read | SELECT only |
| weather_alerts | Active alerts only | SELECT where is_active = true |

---

## 6. Edge Functions (Backend API)

### 6.1 Chat Function (`/functions/chat`)

**Purpose**: AI-powered conversational assistant for agricultural queries

**Endpoint**: `POST /functions/v1/chat`

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "ধানের পাতা হলুদ হয়ে যাচ্ছে কেন?" }
  ]
}
```

**Response**:
```json
{
  "response": "ধানের পাতা হলুদ হওয়ার কারণ হতে পারে..."
}
```

**System Prompt Configuration**:
- Language: Bengali
- Expertise: Crop diseases, fertilizers, irrigation, market advice
- Response style: Simple, actionable, step-by-step

---

### 6.2 Disease Detection (`/functions/detect-disease`)

**Purpose**: AI-powered crop disease diagnosis from images

**Endpoint**: `POST /functions/v1/detect-disease`

**Request Body**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response**:
```json
{
  "result": {
    "diseaseName": "ব্লাস্ট রোগ (Rice Blast)",
    "confidence": 85,
    "cropType": "ধান",
    "severity": "medium",
    "symptoms": ["পাতায় হীরা আকৃতির দাগ", "দাগের কেন্দ্র ধূসর"],
    "causes": ["Magnaporthe oryzae ছত্রাক", "অতিরিক্ত আর্দ্রতা"],
    "treatment": "ট্রাইসাইক্লাজল ০.৬ গ্রাম/লিটার পানিতে...",
    "preventiveMeasures": ["প্রতিরোধী জাত ব্যবহার", "সুষম সার প্রয়োগ"],
    "fertilizer": "ইউরিয়া কমান, পটাশ বাড়ান",
    "irrigation": "সেচ নিয়ন্ত্রণ করুন",
    "organicSolution": "নিম তেল স্প্রে",
    "chemicalSolution": "ট্রাইসাইক্লাজল ০.৬ গ্রাম/লিটার",
    "expectedRecoveryDays": 14,
    "yieldImpact": "২০-৩০%",
    "isHealthy": false,
    "additionalNotes": "আক্রান্ত পাতা সরিয়ে ফেলুন"
  }
}
```

---

### 6.3 RAG Answer (`/functions/rag-answer`)

**Purpose**: Retrieval-Augmented Generation for knowledge-base queries

**Endpoint**: `POST /functions/v1/rag-answer`

**Request Body**:
```json
{
  "question": "আমন ধানে কখন সার দিতে হয়?",
  "type": "rag"
}
```

**Response**:
```json
{
  "answer": "আমন ধানে সার প্রয়োগের সময়সূচি...",
  "sources": "BARI, কৃষি সম্প্রসারণ অধিদপ্তর",
  "type": "rag"
}
```

**Additional Modes**:
- `type: "moderate"` - Forum post moderation

---

### 6.4 Fertilizer Scan (`/functions/scan-fertilizer`)

**Purpose**: Analyze fertilizer packaging images

**Endpoint**: `POST /functions/v1/scan-fertilizer`

---

### 6.5 Mapbox Token (`/functions/get-mapbox-token`)

**Purpose**: Securely provide Mapbox token for map functionality

**Endpoint**: `GET /functions/v1/get-mapbox-token`

---

## 7. Frontend Structure

### Directory Structure

```
src/
├── assets/              # Static images
├── components/
│   ├── seo/            # SEO components
│   └── ui/             # UI components (shadcn + custom)
├── contexts/           # React contexts
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAdminAnalytics.tsx
│   ├── useAnalyticsTracker.tsx
│   ├── useBengaliVoiceInput.tsx
│   ├── useCalendarEvents.tsx
│   ├── useChatHistory.tsx
│   ├── useCommunityPosts.tsx
│   ├── useFarmingTips.tsx
│   ├── useGovSchemes.tsx
│   ├── useLocation.tsx
│   ├── useMarketPrices.tsx
│   ├── useMobile.tsx
│   ├── useOfflineStatus.tsx
│   ├── useTextToSpeech.tsx
│   ├── useWeather.tsx
│   └── useWeatherAlerts.tsx
├── integrations/
│   └── supabase/
│       ├── client.ts   # Supabase client
│       └── types.ts    # Generated types
├── lib/
│   └── utils.ts        # Utility functions
├── pages/              # Page components
│   ├── AdminAnalyticsPage.tsx
│   ├── AuthPage.tsx
│   ├── CalendarPage.tsx
│   ├── CameraPage.tsx
│   ├── ChatPage.tsx
│   ├── ClimateAlertPage.tsx
│   ├── CommunityPage.tsx
│   ├── CompassPage.tsx
│   ├── DemoPage.tsx
│   ├── DiagnosisPage.tsx
│   ├── FarmingCalendarPage.tsx
│   ├── FertilizerPage.tsx
│   ├── FertilizerScanPage.tsx
│   ├── GamificationPage.tsx
│   ├── GovServicesPage.tsx
│   ├── HistoryPage.tsx
│   ├── HomePage.tsx
│   ├── KnowledgePage.tsx
│   ├── LandCalculatorPage.tsx
│   ├── MachineOptimizerPage.tsx
│   ├── MapPage.tsx
│   ├── MarketPage.tsx
│   ├── NASAFarmNavigatorsPage.tsx
│   ├── NPKCalculatorPage.tsx
│   ├── PestMapPage.tsx
│   ├── ProfilePage.tsx
│   ├── SatellitePage.tsx
│   ├── SettingsPage.tsx
│   ├── SplashPage.tsx
│   ├── StoragePage.tsx
│   ├── SupportPage.tsx
│   └── WeatherPage.tsx
├── App.tsx             # Root component
├── index.css           # Global styles
└── main.tsx            # Entry point
```

### Key Components

| Component | Purpose |
|-----------|---------|
| BottomNav | Mobile navigation bar |
| WeatherWidget | Weather display widget |
| MarketPriceRow | Market price display |
| DiseaseCard | Disease detection results |
| ChatBubble | Chat message display |
| VoiceInputButton | Bengali voice input |
| OfflineBanner | Offline status indicator |
| GamificationBadge | Achievement badges |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| useAdminAnalytics | Admin dashboard data |
| useAnalyticsTracker | Event tracking |
| useBengaliVoiceInput | Speech-to-text |
| useCalendarEvents | Calendar CRUD |
| useChatHistory | Chat persistence |
| useMarketPrices | Market data |
| useTextToSpeech | Text-to-speech |
| useWeather | Weather data |
| useOfflineStatus | Offline detection |
| **useOpenETData** | NASA OpenET evapotranspiration data |
| **useCropCASMAData** | NASA Crop-CASMA soil moisture analysis |
| **useNASAEarthObservation** | NASA satellite data integration |
| **useNASAWeatherData** | NASA weather forecasting |

---

## 8. Authentication

### Authentication Flow

```
                    ┌─────────────┐
                    │  SplashPage │
                    └──────┬──────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌───────────────┐           ┌─────────────────┐
    │  Not Logged   │           │   Logged In     │
    │  (Guest Mode) │           │   (Full Access) │
    └───────┬───────┘           └────────┬────────┘
            │                            │
            ▼                            ▼
    ┌───────────────┐           ┌─────────────────┐
    │   AuthPage    │           │    HomePage     │
    │  (Login/Reg)  │           │   (Dashboard)   │
    └───────────────┘           └─────────────────┘
```

### Supported Auth Methods

- Email/Password registration
- Email/Password login
- Auto-confirm enabled (no email verification required)

### Session Management

- Sessions persist via localStorage
- Auto token refresh enabled
- Profile auto-created on signup via trigger

---

## 9. AI Capabilities

### AI Models Used

| Model | Use Case |
|-------|----------|
| google/gemini-2.5-flash | Chat, Disease Detection, RAG |

### AI Features

1. **Conversational Chat**
   - Natural language understanding in Bengali
   - Context-aware responses
   - Agricultural domain expertise

2. **Image Analysis**
   - Crop disease detection
   - Fertilizer package reading
   - Visual symptom analysis

3. **RAG (Retrieval-Augmented Generation)**
   - Knowledge base search
   - Source-cited answers
   - BARI research integration

4. **Content Moderation**
   - Forum post validation
   - Spam detection
   - Agricultural relevance check

---

## 10. PWA & Offline Support

### PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Core features work offline
- **Background Sync**: Data syncs when online
- **Push Notifications**: Weather and price alerts (planned)

### Service Worker

Configured via `vite-plugin-pwa`:

```javascript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'AgriBrain AI',
    short_name: 'agriশক্তি',
    theme_color: '#10B981',
    background_color: '#1A1A2E',
    display: 'standalone',
    start_url: '/',
    icons: [...]
  }
})
```

### Offline Capabilities

| Feature | Offline Support |
|---------|-----------------|
| View cached pages | ✅ |
| Read market prices (cached) | ✅ |
| View weather (cached) | ✅ |
| AI Chat | ❌ (requires internet) |
| Disease Detection | ❌ (requires internet) |
| Data sync | Auto on reconnect |

---

## 11. Internationalization

### Supported Languages

- **Bengali (বাংলা)** - Primary
- **English** - Secondary

### Implementation

Language context provides translation via `LanguageContext.tsx`:

```typescript
const { language, setLanguage, t } = useLanguage();

// Usage
<h1>{t('welcome')}</h1>
```

### Translation Keys

Translations are embedded in the context with key-value pairs for both languages.

---

## 12. Security

### Security Measures

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - User data isolated by user_id
   - Admin-only access for analytics

2. **Role-Based Access Control**
   - Separate `user_roles` table
   - Security definer function `has_role()`
   - No role storage in profile (prevents escalation)

3. **API Security**
   - Edge functions require auth headers
   - CORS configured
   - API keys stored as secrets

4. **Data Protection**
   - Passwords hashed by Supabase Auth
   - Sensitive data not exposed in client
   - Environment variables for secrets

### Security Best Practices Implemented

- ✅ RLS on all user data tables
- ✅ Separate roles table
- ✅ Server-side role checking
- ✅ No sensitive data in localStorage
- ✅ HTTPS only
- ✅ Input validation

---

## 13. Deployment

### Deployment Pipeline

```
Git Push → Lovable CI → Build → Deploy → CDN
                           ↓
                    Edge Functions Deploy
                           ↓
                    Database Migrations
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anon key |
| LOVABLE_API_KEY | Lovable AI Gateway key |
| MAPBOX_PUBLIC_TOKEN | Mapbox API key |

### Build Configuration

```bash
# Production build
npm run build

# Preview build
npm run preview
```

---

## 14. API Reference

### Supabase Client Usage

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('market_prices')
  .select('*')
  .order('updated_at', { ascending: false });

// Insert data
const { error } = await supabase
  .from('analytics_events')
  .insert({ event_type: 'page_view', event_name: 'home' });

// Call edge function
const { data, error } = await supabase.functions.invoke('chat', {
  body: { messages: [...] }
});
```

### API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/functions/v1/chat` | POST | AI chat |
| `/functions/v1/detect-disease` | POST | Disease detection |
| `/functions/v1/rag-answer` | POST | Knowledge Q&A |
| `/functions/v1/scan-fertilizer` | POST | Fertilizer analysis |
| `/functions/v1/get-mapbox-token` | GET | Mapbox token |

---

## 15. Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Tailwind CSS utility classes
- Component-based architecture

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Push to GitHub
5. Auto-deploy via Lovable

---

## Appendix

### A. Useful Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)

### B. Contact

For support or questions, contact the development team.

---

## 16. Future Vision & Goals

### Short-Term Goals (6 Months)

#### 🎯 Enhanced AI Accuracy
- Improve disease detection to 95%+ accuracy
- Add more crop varieties support (100+ crops)
- Real-time pest identification with geo-tracking

#### 📱 Mobile App Launch
- Native Android app development
- iOS app development
- Improved offline capabilities with local AI models

#### 🎤 Voice-First Experience
- Full Bengali voice navigation
- Voice-based disease reporting
- Audio farming guides and tutorials

### Medium-Term Goals (1-2 Years)

#### 🌐 IoT Integration
- Soil sensor connectivity
- Automated irrigation systems
- Weather station integration
- Smart greenhouse monitoring

#### 🛒 Marketplace Platform
- Direct farmer-to-consumer sales
- Agricultural input marketplace
- Equipment rental system
- Logistics integration

#### 💰 Financial Services
- Crop insurance integration
- Microfinance connections
- Payment processing
- Loan eligibility checker

#### 🚁 Drone Technology
- Aerial crop monitoring
- Precision spraying
- Field mapping
- Damage assessment

### Long-Term Vision (3-5 Years)

#### 🤖 AI-Powered Precision Agriculture
- Predictive analytics for crop yields
- Automated farm management
- Climate-smart recommendations
- Carbon footprint tracking

#### 🌏 Regional Expansion
- South Asian countries coverage
- Multi-language support (Hindi, Urdu, Tamil, Nepali)
- Regional crop databases
- Cross-border market data

#### 🔬 Research Integration
- University partnerships
- Research data contribution
- Farmer experiments platform
- Agricultural innovation hub

#### ⛓️ Blockchain Integration
- Supply chain transparency
- Quality certification
- Fair trade verification
- Smart contracts for transactions

### Impact Goals

| Metric | Target (5 Years) |
|--------|------------------|
| Active Users | 10 Million+ |
| Farmers Helped | 5 Million+ |
| Districts Covered | All 64 in Bangladesh |
| Crop Diseases Detectable | 200+ |
| Languages Supported | 10+ |
| Partner Organizations | 100+ |

### Technology Roadmap

```
2024 Q4: PWA Optimization + Voice Enhancement
    ↓
2025 Q1: Android Native App Launch
    ↓
2025 Q2: IoT Sensor Integration
    ↓
2025 Q3: Marketplace Beta
    ↓
2025 Q4: Financial Services Integration
    ↓
2026 Q1: Drone Technology Pilot
    ↓
2026 Q2: Regional Expansion (India, Nepal)
    ↓
2026 Q3: Blockchain Implementation
    ↓
2026 Q4: Full Precision Agriculture Suite
```

---

## 17. References & Data Sources

### Agricultural Data Sources
- Bangladesh Agricultural Research Institute (BARI)
- Bangladesh Rice Research Institute (BRRI)
- Department of Agricultural Extension (DAE)
- Bangladesh Meteorological Department (BMD)
- Food and Agriculture Organization (FAO)

### Technology References
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini AI](https://ai.google.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Mapbox GL JS](https://docs.mapbox.com)

### Agricultural Books Referenced
- "বাংলাদেশের কৃষি" - Bangladesh Agricultural Research Council
- "ধান চাষ পদ্ধতি" - BRRI Publication
- "সমন্বিত বালাই ব্যবস্থাপনা" - DAE Manual
- "জৈব কৃষি নির্দেশিকা" - BARC
- "Modern Agriculture Practices" - FAO Publications

### Research Papers
- AI in Agriculture: A Comprehensive Review
- Machine Learning for Crop Disease Detection
- IoT Applications in Smart Farming
- Precision Agriculture in Developing Countries

---

## 18. Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Tailwind CSS utility classes
- Component-based architecture

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Push to GitHub
5. Auto-deploy via Lovable

---

## Appendix

### A. Useful Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)

### B. Contact

**Team Lead:** Samin Yasar  
**Institution:** Mymensingh Engineering College  
**Project:** AgriShokti (কৃষিশক্তি)

For support or questions, contact **TEAM_NEWBIES**.

---

**© 2024 AgriShokti - TEAM_NEWBIES**

*Developed by Samin Yasar & Team | Mymensingh Engineering College*

*Empowering Bangladeshi Farmers with AI-Powered Agricultural Intelligence*
