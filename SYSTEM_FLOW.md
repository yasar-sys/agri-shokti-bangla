# Agri-Logic Pipeline: Comprehensive Architecture

This document serves as the official technical blueprint for **Agri Shokti**, demonstrating the "n8n-style" workflow orchestration and Agentic AI reasoning for the **MXB 2026** AgriTech judging committee.

---

## 1. The 4-Stage "Agri-Logic" Workflow
Our architecture implements a "Generational Leap" in agricultural advisory, moving from simple chatbots to a sensing-driven expert system.

```mermaid
graph TD
    %% Use Class styling for distinct sections
    classDef sensing fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef reasoning fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef validation fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef action fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;

    %% Stage 1: Sensing
    subgraph S1 [Stage 1: Contextual Sensing]
        A[📡 AgroMonitoring API] -->|NDVI Data| B(Field Health Map)
        W[🌡️ NASA POWER Weather] --> B
        User[📸 User Photo] -->|Upload| C(Input Handler)
    end

    %% Stage 2: Reasoning
    subgraph S2 [Stage 2: Adaptive Reasoning]
        B -->|Context| D{🧠 Gemini 2.5 Flash}
        C -->|Visuals| D
        E[🌱 Soil Data (Crop-CASMA)] --> D
    end

    %% Stage 3: Validation
    subgraph S3 [Stage 3: Expert Validation]
        D -->|Draft Logic| F[📚 RAG Agent]
        F -->|Search| G[(BARI / FAO DB)]
        G -->|Verified Protocol| F
        F -->|Approved Logic| H(Synthesizer)
    end

    %% Stage 4: Action
    subgraph S4 [Stage 4: Hyper-Localized Delivery]
        H -->|JSON| I[🎙️ Bangla Voice Engine]
        H -->|Alert| J[⚡ Notification Trigger]
        H -->|UI Update| K[📱 Mobile Cards]
    end

    class A,B,W,User,C sensing;
    class D,E reasoning;
    class F,G,H validation;
    class I,J,K action;
```

---

## 2. "n8n Alike" Workflow Orchestration
Agri Shokti uses **Supabase Edge Functions** to mimic a node-based automation workflow (similar to n8n). Each step is a discrete "Node" that passes data to the next.

| Step | Node Type | Function Details | Input -> Output |
| :--- | :--- | :--- | :--- |
| **1. Trigger** | `Webhook` | **User uploads image** or **Scheduler** (Daily 7 AM). | `Base64 Image` -> `event_id` |
| **2. Vision Node** | `AI Analysis` | **`detect-disease`**: Analyzes visual symptoms. | `Image` -> `Disease Probabilities` |
| **3. Logic Node** | `Vector Search` | **`rag-answer`**: Fetches BARI treatment protocols. | `Disease Name` -> `Treatment Plan` |
| **4. Voice Node** | `Synthesis` | **`text-to-speech`**: Generates Bangla audio file. | `Text` -> `Audio Blob` |
| **5. Action Node** | `DB Write` | **`update_history`**: Saves result & notifies user. | `Result` -> `Confirmation` |

---

## 3. Technology Stack Layering
Our stack bridges high-level satellite data with ground-level reality.

*   **Geospatial Layer**: **AgroMonitoring API** (Sentinel-2), NASA OpenET, NASA Crop-CASMA.
*   **AI/ML Core**: **Gemini 2.5 Flash** (Multimodal Orchestrator), text-embedding-004.
*   **Backend & DB**: **Supabase** (PostgreSQL, pgvector, Edge Functions).
*   **Frontend**: React (Vite) + Tailwind CSS + Recharts (Visualization).
*   **Reliability**: Offline-first PWA architecture with background sync.

---

> [!TIP]
> **Agricultural Consultant Analogy**: Think of our system as a team of experts. The Satellite is the **Scout**; the Database is the **Librarian**; the LLM is the **Chief Agronomist**; and the Voice Interface is the **Field Officer** speaking directly to the farmer.
