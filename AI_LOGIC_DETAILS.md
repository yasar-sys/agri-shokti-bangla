# AI Core: Data Flow & Decision Logic Details

This document details the **"Technical Nervous System"** of **Agri Shokti**, explaining how raw data is transformed into validated agricultural intelligence.

---

## 1. Data Ingestion & Preprocessing (Senses)
The foundation of our AI's judgment is built on high-fidelity, processed data.
*   **Multi-Source Ingestion**: Data is ingested from three primary streams:
    *   **External Knowledge**: BARI crop manuals, DAE pest datasets, and NASA Soil/NDVI spectral data.
    *   **User Context**: Personalized soil history, previous crop cycles, and regional identifiers.
    *   **Live Inputs**: Multimodal data (Voice queries, Leaf photos, Fertilizer sack images).
*   **Preprocessing Pipeline**: 
    *   **Cleaning**: Removal of noise from voice/image inputs to optimize LLM comprehension.
    *   **Anonymization**: PII (Personally Identifiable Information) is stripped at the Edge layer to ensure **Ethics & Privacy** compliance.
    *   **Embedding**: Raw text is converted into 1536-dimensional vectors using **text-embedding-004**, specifically optimized for Bangla-English technical terminology.

---

## 2. Core Reasoning Chain (The Brain)
*   **User Profiling**: Every query is contextualized with the user's past data (e.g., "Rice farmer in Sylhet with previous Blast history").
*   **RAG Retrieval**: The system performs a semantic similarity search in our **Supabase PG Vector** database, retrieving the specific BARI protocol relevant to the current stressor.
*   **Agentic Orchestration (MCP)**: The master logic engine (Gemini 2.5 Flash) coordinates multiple **specialist agents**:
    *   One agent identifies the pest via image analysis.
    *   Another agent retrieves the legal pesticide dosage from the RAG store.
    *   The orchestrator synthesizes both into a final, safe recommendation.

---

## 3. Decision Validation & Guardrails (Judgment)
To achieve **"Explainable AI,"** our system includes rigorous validation layers:
*   **Explainability Layer**: Every diagnosis includes a "Reasoning Logic" block that explains *why* the AI reached its conclusion based on visual symptoms and BARI data.
*   **Hallucination Guardrail**: A dedicated "Fact-Check Pass" compares the final advice against the source PDF context. If they conflict, the system downgrades the confidence score and requests a photo for expert human-in-the-loop review.
*   **Safety Thresholds**: Decisions affecting chemical dosage or harvesting require a confidence score >85% before an automated action is triggered.

---

## 4. Output Generation & Automation (Muscle)
*   **Multimodal Delivery**: The logic is converted into context-rich **Bangla Voice**, technical **PDF Dashboards**, or simple **SMS Alerts** for low-connectivity users.
*   **Automation Triggers**: Using **Supabase Edge Functions**, the system triggers real-world events:
    *   Updating the community **Pest Heatmap**.
    *   Triggering a **Climate Alert** push notification.
    *   Initiating a **Drone Route** optimization plan.

---

## 5. Self-Evolving Feedback Loop (Growth)
*   **Interaction Logging**: Every AI interaction (Input -> Logic -> Output) is logged in our `ai_feedback` table.
*   **Continuous Improvement**: We analyze common failures or low-confidence scores to identify "Knowledge Gaps" in our RAG store.
*   **Self-Evolving Genome**: Periodically, successful human-verified interactions are re-embedded into the Knowledge Base, allowing the system to "learn" from localized farming nuances over time.

---

> [!IMPORTANT]
> **Technical Implementation Summary**: This flow ensures that **Agri Shokti** acts as a reliable, traceable, and improving agricultural brain, rather than a static chatbot.
