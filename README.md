# 🌾 AgriShokti (কৃষিশক্তি)

**AI-Powered Precision Agriculture Assistant for Bangladesh**  
*Bridging the gap between NASA Satellite Data and the Rural Farmer.*

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://agri-shokti-ai.vercel.app/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PgVector-green?logo=supabase)](https://supabase.com/)
[![Gemini 2.5](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange?logo=google)](https://deepmind.google/technologies/gemini/)
[![NASA OpenET](https://img.shields.io/badge/Data-NASA%20OpenET-red)](https://openetdata.org/)

---

## 🏆 Project Overview (পরিচিতি)

**AgriShokti** (means "Agricultural Power") is a specialized localized PWA designed to empower Bangladeshi smallholders. Unlike generic chatbots, AgriShokti uses a **4-Stage Reasoning Pipeline** to combine real-time Satellite Imagery (Sentinel-2) with ground-level diagnostics (Computer Vision), verified against national agricultural standards (BARI/FAO).

> **The "10X" Innovation:** We have built a **Satellite-to-Ground-Truth Loop**. The system detects crop stress from space (low NDVI) and proactively asks the farmer to "verify" the specific spot via a photo, creating a self-learning precision map.

### 👥 Team Newbies
| Name | Institution | Role |
|---|---|---|
| **Samin Yasar** | Mymensingh Engineering College | Team Lead & Prompt Engineer |
| **Rahiatul Jannat** | Mymensingh Engineering College | Frontend Developer |
| **Maisha Osman Umama** | Mymensingh Engineering College | System Analyst |
| **Neshat Sultana Keya** | Gazipur Agricultural University | Agricultural Expert |

---

## 🧠 AI Logic & Architecture

Our system mimics an **n8n-style automation workflow**, orchestrated by **Supabase Edge Functions**:

1.  **Contextual Sensing (The Eyes)**:
    *   Ingests **AgroMonitoring** (NDVI) and **NASA POWER** (Weather) data.
    *   Creates a live "Field Health Map".
2.  **Adaptive Reasoning (The Brain)**:
    *   **Gemini 2.5 Flash** analyzes crop photos for diseases (`/functions/detect-disease`).
    *   Cross-references symptoms with local seasonality.
3.  **Expert Validation (The Library - RAG)**:
    *   **Retrieval Augmented Generation** checks advice against vectorized **BARI (Bangladesh Agricultural Research Council)** PDF guidelines.
    *   *Guardrail*: If AI advice contradicts BARI safety limits, it is flagged.
4.  **Localized Delivery (The Voice)**:
    *   Converts complex advice into **Bangla Voice Audio** for low-literacy accessibility.

---

## 💡 Key Features (মূল ফিচারসমূহ)

### 🛰️ NASA Farm Navigators
*   **Satellite Vision (NDVI)**: Real-time crop health monitoring using Sentinel-2/Landsat data.
*   **Water Balance**: Irrigation advice based on **NASA OpenET**.
*   **Soil Moisture**: Drought alerts via **NASA Crop-CASMA**.

### 🌾 Smart Farming Tools
*   **📸 AI Disease Doctor**: Instant diagnosis from leaf photos with offline support.
*   **💬 AgriBot**: Voice-first assistant that speaks the local dialect.
*   **🔍 Fertilizer Scanner**: Detects fake fertilizer packaging.
*   **🗺️ Pest Heatmap**: Community-driven outbreak warnings.
*   **📅 Dynamic Calendar**: Tasks adjusted automatically by weather forecasts.

---

## 🗄️ Data Sources (তথ্যের উৎস)

| Source | Usage |
|---|---|
| **NASA OpenET** | Evapotranspiration & Water Management |
| **NASA Crop-CASMA** | Soil Moisture & Drought Monitoring |
| **AgroMonitoring** | Sentinel-2 NDVI & Historical Satellite Data |
| **NASA POWER** | GMAO Weather Forecasting |
| **BARI & BRRI** | Official Treatment Protocols (Vector Store) |
| **SoilGrids** | Soil pH & Texture Data |

---

## 🛠️ Technology Stack

*   **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI, Recharts.
*   **Backend**: Supabase (Auth, Database, Realtime).
*   **AI/ML**: Google Gemini 2.5 Flash (Vision & Chat), text-embedding-004.
*   **Logic**: Supabase Edge Functions (Deno).
*   **Maps**: Mapbox GL JS + Leaflet.

---

## 📄 License & Copyright

**MIT License** © 2025 Team_Newbies

> **Competition Note**: This repository identifies specific prompts and architecture decisions in `PROMPT_LIBRARY.md` and `AI_LOGIC_DETAILS.md` for judging transparency.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yasar-sys/agri-shokti-bangla.git

# Install dependencies
npm install

# Set up Environment Variables (.env)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Run locally
npm run dev
```
