# Agri-Shokti Bangla — Final Pitch Structure

Audience: Judges evaluating technical depth (AI logic, prompts, system architecture).  
Goal: A succinct, slide-by-slide pitch deck that highlights the product, technical design, and verifiable implementation in your repo.
Language: **Bangla / English** (The pitch should be delivered in Bangla/English mix as appropriate, but the structure is universal).

Estimated deck: 12–16 slides (10–12 minutes). Aim for clarity: 1 slide / minute.

---

## Slide 1 — Title
- **Title**: "Agri-Shokti" (কৃষিশক্তি)
- **Subtitle**: "AI-Powered Agricultural Intelligence for Bangladesh"
- **Team**: TEAM_NEWBIES
- **Repo link**: https://github.com/yasar-sys/agri-shokti-bangla
- **Speaker note**: "We are building the 'Brain' for the Bangladeshi farmer."

## Slide 2 — Problem (Agri-Gap)
- **Core Issues**:
  1.  **Information Gap**: Farmers rely on hearsay, not science.
  2.  **Language Barrier**: "Satellite data" is useless if not explained in simple Bangla.
  3.  **Late Diagnosis**: Diseases are often identified when it's too late.
- **Statistic**: "Smallholders lose 20-30% yield due to preventable diseases."
- **Speaker note**: Emphasize that farmers *have* data (visual symptoms) but lack the *tool* to interpret it.

## Slide 3 — Solution: Agri-Shokti
- **Product**: A PWA (Progressive Web App) that works offline and speaks Bangla.
- **Key Features**:
  - **AI Disease Doctor**: Instant diagnosis from photos.
  - **NASA Farm Navigators**: Integration of OpenET & Crop-CASMA for water/soil analysis.
  - **Voice-First**: Talk to the app in local dialect.
- **Visual**: Show the "HomePage" with the Dashboard and "Scan" button.

## Slide 4 — Demo (The "Wow" Moment)
- **Flow**:
  1.  Open App -> Click "Scan Crop".
  2.  Upload a leaf photo -> See "Gemini 2.5 Flash" analyzing.
  3.  **Result**: Disease Name (in Bangla), Treatment, and *Audio Explanation*.
- **Live Element**: Play the Bangla Text-to-Speech response.
- **Reference**: `src/pages/DianaosisPage.tsx` / `/functions/detect-disease`

## Slide 5 — Tech Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS (Shadcn/UI).
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions).
- **AI Core**: Google Gemini 2.5 Flash (Multimodal) + text-embedding-004.
- **Geospatial**: AgroMonitoring API + NASA POWER + OpenET.
- **DevOps**: Lovable Cloud / Vercel.

## Slide 6 — System Architecture (The "Brain")
- **Diagram**:
  - User (React PWA) <--> Supabase Edge Functions.
  - Edge Functions <--> Gemini AI.
  - Edge Functions <--> AgroMonitoring/NASA APIs.
  - Edge Functions <--> Supabase Database (pgvector).
- **Key Concept**: "MCP-Style Specialist Agents" (Vision Agent, Geo Agent, RAG Agent).

## Slide 7 — AI Logic & RAG (The "Library")
- **Hallucination Control**:
  - We don't just ask ChatGPT. We use **RAG (Retrieval-Augmented Generation)**.
  - **Source**: BARI (Bangladesh Agricultural Research Institute) Guidelines (PDFs -> Embeddings).
  - **Logic**: User Query -> Search Vector DB -> Retrieve BARI Context -> Gemini Answers.
- **Evidence**: `AI_LOGIC_DETAILS.md` and `/functions/rag-answer`.

## Slide 8 — 10X Innovation: Satellite-to-Ground Loop
- **Feature**: "NASA Farm Navigators"
- **The Concept**:
  - Satellite (Sentinel-2) sees a "Yellow Patch" (NDVI drop).
  - App alerts Farmer: "Check the North-East corner."
  - Farmer takes photo.
  - AI confirms: "It's Nitrogen deficiency."
  - Result: **Precision Intervention**.
- **Data Sources**: NASA OpenET (Water), Crop-CASMA (Soil Moisture).

## Slide 9 — Prompt Engineering (Show Your Work)
- **Categories**: Ideation, Architecture, Coding, Evaluation.
- **Example Prompt**:
  - *"Act as a local agronomist. Review this disease diagnosis against BARI 2023 guidelines. If the Urea dosage is >5% off, flag it."*
- **Reference**: `PROMPT_LIBRARY.md`.

## Slide 10 — Security & Privacy
- **RBAC**: Role-Based Access Control (Admin, Farmer, Expert).
- **RLS**: Row Level Security on Supabase (Farmers only see their own land data).
- **Data Safety**: Encrypted data at rest and in transit.

## Slide 11 — Team: TEAM_NEWBIES
- **Samin Yasar**: Team Lead, Prompt Engineer & Full Stack Dev.
- **Rahiatul Jannat**: Developer.
- **Maisha Osman Umama**: Developer.
- **Neshat Sultana Keya**: Agricultural Expert (Gazipur Agricultural University).
- **Strengths**: Engineering + Agricultural Science mix.

## Slide 12 — Roadmap & Impact
- **Now**: 95% Accuracy on Rice & Potato diseases.
- **Next 6 Months**: IoT Soil Sensor integration.
- **Goal**: Cover all 64 districts in Bangladesh.
- **Ask**: Mentorship & Compute Credits to scale.

## Slide 13 — Appendix: Code & Links
- **GitHub**: https://github.com/yasar-sys/agri-shokti-bangla
- **Documentation**: `PROJECT_DOCUMENTATION.md`
- **Key Folders**: `src/`, `supabase/functions/`

---
**Note for Presenter**: Focus on the *integration* of Global Data (NASA) with Local Context (BARI + Bangla Voice). That is your winning edge.
