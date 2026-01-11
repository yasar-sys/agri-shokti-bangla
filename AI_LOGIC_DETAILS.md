# AI Core: AgriTech Challenge Logic Details

This document provides a technical deep-dive into the AI architecture and "Innovation Edge" features that allow **Agri Shokti** (কৃষিশক্তি) to deliver 10X impact in the precision agriculture sector.

---

## 1. Problem Statement & Target Users
*   **Gap**: Bangladeshi smallholders lack access to scientifically grounded, localized, and real-time advice. General LLMs "hallucinate" local dosages, and satellite data is often too technical for farmers to interpret.
*   **Target Users**: Individual smallholders (primary), agricultural cooperatives (secondary), and regional policy planners (tertiary).
*   **Mission**: Bridge the gap between sophisticated **NASA/Sentinel-2** data and ground-level farmer reality.

---

## 2. The 4-Stage Reasoning Chain
Our "Agri-Logic" pipeline performs adaptive reasoning across four distinct phases, orchestrated by **Supabase Edge Functions** and **Gemini 2.5 Flash**:

### Stage 1: Contextual Sensing (The Eyes)
The system ingests real-time data from multiple sources:
*   **AgroMonitoring API**: Integrates Sentinel-2 & Landsat data for Field Health Maps (NDVI/EVI).
*   **NASA POWER**: GMAO GEOS-FP data for weather forecasting.(Demo available right now)
*   **OpenET**: Evapotranspiration data for water management.(Demo available right now)
*   **Crop-CASMA**: Soil moisture analysis.(Demo available right now)

### Stage 2: Adaptive Reasoning (The Brain)
The central LLM (**Gemini 2.5 Flash**) processes the health map alongside ground-level data. It operates via specific Edge Functions:

#### Disease Detection Logic (`/functions/detect-disease`)
*   **Input**: Base64 image of the affected crop.
*   **Process**: Multimodal analysis using Gemini 2.5 Flash.
*   **Output Schema**:
    ```json
    {
      "result": {
        "diseaseName": "Rice Blast (ব্লাস্ট রোগ)",
        "confidence": 85,
        "symptoms": ["Diamond shaped lesions", "Gray centers"],
        "treatment": "Apply Tricyclazole 0.6g/L...",
        "preventiveMeasures": ["Use resistant varieties"],
        "fertilizer": "Reduce Urea, increase Potash",
        "yieldImpact": "20-30%"
      }
    }
    ```

### Stage 3: Expert Validation (The Library - RAG)
To prevent hallucinations, all advice is cross-verified against the **BARC (Bangladesh Agricultural Research Council)** guidelines stored in a **Supabase pgvector** database.

#### RAG Verification Logic (`/functions/rag-answer`)
*   **Query**: "When to apply fertilizer for Amon rice?"
*   **Retrieval**: Fetches relevant chunks from BARI/BRRI PDF embeddings.
*   **Synthesis**: Generates an answer cited with official sources.
*   **Guardrails**: If the LLM's raw suggestion deviates >5% from the BARI guide, the BARI guide takes precedence.

### Stage 4: Hyper-Localized Delivery (The Voice future addition)
Actionable advice is delivered through a **voice-first interface in Bangla**, ensuring accessibility for low-literacy users.
*   **Text-to-Speech**: Converts the JSON response into natural sounding Bangla audio.(Demo available right now)
*   **Visual Cards**: Renders "Treatment Cards" on the mobile UI.

---

## 3. The "Innovation Edge" (10X Mindset)
To deliver a generational leap in technology, we implement the following disruptive features:
*   **NASA Farm Navigators**: Direct integration of OpenET, Crop-CASMA, and Earth Observation data.(Demo available right now)
*   **Climate Twin (Harvest Simulation)**: A model that simulates future harvests under different climate scenarios.(Demo available right now)
  
*   **Satellite-to-Farmer Feedback Loop**: The system identifies health drops from space (NDVI decrease) and pro-actively asks the farmer to "verify" via a photo. This ground-truth data trains the model.
*   **Hybrid-Edge Logic**: Critical agricultural logic works on low-bandwidth connections by caching previous field cycles.

---

## 4. Automation & System Flow (n8n Style)
Our backend mimics an n8n workflow using composed Edge Functions:

1.  **Trigger**: New Scan Upload or Daily Scheduler.
2.  **Node 1 (Vision)**: `detect-disease` identifies the issue.
3.  **Node 2 (Logic)**: `rag-answer` retrieves the specific BARI protocol for that disease.
4.  **Node 3 (Action)**: Updates `user_scans` table and triggers a notification.

---

## 5. Technical Stack
*   **Geospatial**: AgroMonitoring API (Sentinel-2/Landsat), NASA GIBS, OpenET.
*   **AI Models**: Gemini 2.5 Flash (Multimodal), text-embedding-004 (RAG).
*   **Backend**: Supabase Edge Functions (Deno), PostgreSQL + pgvector.
*   **Frontend**: React (Vite) + Tailwind CSS + Recharts (Visualization).
