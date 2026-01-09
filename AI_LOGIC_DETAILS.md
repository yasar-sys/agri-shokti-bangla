# AI & Smart Logic Documentation (Comprehensive)

This document details the multi-layered intelligence system of **Agri Shokti**, encompassing generative AI (LLMs), predictive analytics, and sensing logic.

## 1. Generative AI Layer (LLMs)
We use a unified gateway to access high-performance models from Google.

| Feature | Model | Purpose |
| :--- | :--- | :--- |
| **AgriBrain Advisor** | `gemini-2.5-flash` | Context-aware RAG for technical Q&A. |
| **Agricultural Chat** | `gemini-2.5-flash` | Natural language interface for farmers. |
| **Market Intelligence** | `gemini-2.5-flash` | Price delta analysis & selling advice. |
| **Disease/Pest Vision** | `gemini-2.5-flash` | Multimodal symptom & packaging analysis. |

---

## 2. Predictive & Sensing Intelligence
Beyond LLMs, the platform utilizes specialized algorithms to process environmental and spatial data.

### A. Remote Sensing (Satellite & NDVI)
*   **Logic**: Process NASA and Sentinel-2 satellite data to calculate the Normalized Difference Vegetation Index (NDVI).
*   **Metrics**: Health Score (0-1), Vegetation Index, Moisture Level, and Stress Level.
*   **Outcome**: Automatic categorization of fields into "Excellent" to "Critical" health statuses.

### B. Climate-Smart Risk Assessment
*   **Predictive Model**: Correlates live weather metrics (Temp, Humidity, Wind) with crop-specific vulnerability thresholds.
*   **Agri-Risk Scoring**: High humidity (>75%) + Moderate temp (25-30°C) triggers "Fungal Pest Risk" alerts.
*   **Varietal Advice**: Suggests climate-resilient strains (e.g., BRRI-71 for heat, BRRI-51 for floods) based on live alerts.

### C. NPK & Nutrient Logic
*   **Algorithmic Balancing**: Calculates Urea, TSP, MOP dosage using BARI-vetted formulas specialized for 6+ major crops in Bangladesh.
*   **Application Ticketing**: Generates a 3-stage basal and top-dressing schedule based on the crop's physiological growth stages.

---

## Data Provenance, Ethics & Safety
*   **Citations**: All RAG-generated responses include mandatory source attribution (e.g., "Source: BARI Rice Manual").
*   **Safety Thresholds**: If confidence for a diagnosis falls below 70%, the system automatically flags an "Expert Consultation Recommended" alert.
*   **Privacy Layer**: Sensitive user query data is anonymized before log analysis; specifically, PII (Personally Identifiable Information) is never used as part of training or retrieval contexts.
*   **Hallucination Check**: Our multi-step prompting includes a "Factual Verification" pass which compares raw LLM output against the retrieved vector context to ensure no English-to-Bengali translation drift.

---

## 3. Spatial & Mechanical Optimization

### A. Drone Route Optimization
*   **TSP Algorithm**: Uses the Nearest Neighbor heuristic to solve the Traveling Salesman Problem for drone spray patterns.
*   **Zigzag Logic**: Generates optimal waypoints to ensure 100% field coverage with minimal battery drain.

### B. Machine/Fuel Efficiency logic
*   **Consumption Model**: Estimates diesel usage at 3.2L per acre for standard tractors.
*   **Efficiency Tips**: Dynamic advice on RPM (1800-2000) and air-filter maintenance to achieve up to 15% fuel savings.

---

## 4. Community Intelligence (Pest Mapping)
*   **Crowdsourced Risk**: Real-time heatmaps generated from farmer-submitted pest reports.
*   **Verification Engine**: Use of severity filtering (Low/Medium/High) to prioritize district-level emergency alerts.
