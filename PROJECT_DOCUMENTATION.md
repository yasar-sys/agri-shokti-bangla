# AgriBrain AI - Project Documentation

> **An AI-Powered Agricultural Assistant for Bangladesh Farmers**
> 
> Version: 1.0.0 | Last Updated: December 2024

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Features](#4-features)
5. [Database Schema](#5-database-schema)
6. [Edge Functions (Backend API)](#6-edge-functions-backend-api)
7. [Frontend Structure](#7-frontend-structure)
8. [Authentication](#8-authentication)
9. [AI Capabilities](#9-ai-capabilities)
10. [PWA & Offline Support](#10-pwa--offline-support)
11. [Internationalization](#11-internationalization)
12. [Security](#12-security)
13. [Deployment](#13-deployment)
14. [API Reference](#14-api-reference)
15. [Contributing](#15-contributing)

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

## 2. Technology Stack

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

### DevOps & Infrastructure

- **Hosting**: Lovable Cloud
- **CI/CD**: Automatic deployment via Lovable
- **PWA**: Vite PWA Plugin
- **Version Control**: GitHub integration

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

### Additional Features

| Feature | Description |
|---------|-------------|
| NPK Calculator | Fertilizer requirement calculator |
| Land Calculator | Land measurement converter |
| Pest Map | Regional pest outbreak mapping |
| Satellite View | Crop monitoring via satellite |
| Government Services | Scheme information & contacts |
| Knowledge Base | Agricultural articles & guides |
| Profile & Gamification | XP points, achievements, rankings |
| Settings | Theme, language, notifications |

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

**© 2024 AgriBrain AI - Empowering Bangladeshi Farmers with AI**
