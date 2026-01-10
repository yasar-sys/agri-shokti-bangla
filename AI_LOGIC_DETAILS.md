# AI Core: AgriTech Challenge Logic Details

This document provides a technical deep-dive into the AI architecture and "Innovation Edge" features that allow **Agri Shokti** to deliver 10X impact in the precision agriculture sector.

---

## 1. Problem Statement & Target Users
*   **Gap**: Bangladeshi smallholders lack access to scientifically grounded, localized, and real-time advice. General LLMs "hallucinate" local dosages, and satellite data is often too technical for farmers to interpret.
*   **Target Users**: Individual smallholders (primary), agricultural cooperatives (secondary), and regional policy planners (tertiary).
*   **Mission**: Bridge the gap between sophisticated **NASA/Sentinel-2** data and ground-level farmer reality.

---

## 2. The 4-Stage Reasoning Chain
Our "Agri-Logic" pipeline performs adaptive reasoning across four distinct phases:
1.  **Contextual Sensing**: The Geospatial Agent ingests data from the **AgroMonitoring API** (integrating Sentinel-2 & Landsat) to create a **Field Health Map** (NDVI/EVI).
2.  **Adaptive Reasoning**: The central LLM (Gemini 2.5 Flash) processes the health map alongside ground-level data (Soil pH/Moisture) to diagnose stress factors.
3.  **Expert Validation (RAG)**: The diagnosis is cross-verified against **BARC (Bangladesh Agricultural Research Council)** guidelines stored in **Supabase pgvector**.
4.  **Hyper-Localized Delivery**: Actionable advice is delivered through a **voice-first interface in Bangla**, ensuring accessibility for low-literacy users.

---

## 3. The "Innovation Edge" (10X Mindset)
To deliver a generational leap in technology, we implement the following disruptive features:
*   **Climate Twin (Harvest Simulation)**: A model that simulates future harvests under different climate scenarios (e.g., "What happens to my crop if rainfall increases by 20% in Sylhet?").
*   **Satellite-to-Farmer Feedback Loop**: The system identifies health drops from space and asks the farmer to "verify" via a photo. This ground-truth data creates a self-learning system that refines its own sensing accuracy.
*   **Hybrid-Edge Logic**: Critical agricultural logic is architected to work efficiently on low-bandwidth connections, leveraging cached context from the farmer's previous field cycles.

---

## 4. Impact Metrics (Success Measurement)
We measure success through three "North Star" metrics:
*   **Yield Increase (%)**: Targeted 15-20% boost via precision planting and disease prevention.
*   **Input Waste Reduction**: targeted 30% reduction in unnecessary fertilizer/pesticide usage through exact BARI dosage recommendations.
*   **Engagement**: Number of weekly active farmers transitioning from trial to habitual decision-making using the platform.

---

> [!NOTE]
> **Agricultural Consultant Analogy**: Agri Shokti is your digital consultant. The satellite data is its **eyes**; the BARC database is its **library**; the LLM is its **brain**; and the Bangla voice interface is its **voice**.

---

## 5. Technical Stack
*   **Geospatial Processing**: AgroMonitoring API (Sentinel-2/Landsat), Google Earth Engine.
*   **AI Core**: Gemini 2.5 Flash, text-embedding-004.
*   **Automation**: n8n-style workflow triggers via Supabase Edge.
*   **Database**: Supabase PostgreSQL with pgvector extension.
