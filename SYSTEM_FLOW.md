# Comprehensive System Architecture & Engineering Blueprints

This document serves as the official technical blueprint for **Agri Shokti**, designed to demonstrate high-level technical implementation and AI reasoning for the **MXB 2026** judging committee.

---

## 1. High-Level System Overview (The Big Picture)
Our architecture follows a clean **Input → Intelligent Logic → Output** paradigm, ensuring seamless interaction for rural farmers while maintaining high technical rigor.

```mermaid
graph LR
    %% User Input Layer
    subgraph "Phase 1: Multi-Modal Input"
        U1["🗣️ Voice Query"]
        U2["📸 Field/Pack Photo"]
        U3["✍️ Text Question"]
    end

    %% AI Core Layer
    subgraph "Phase 2: AI Intelligence Core"
        G1{{"🛡️ Gateway & Router"}}
        G2["🤖 Gemini 2.5 Flash<br/>(Multimodal Reasoning)"]
        G3["📚 Multi-Source RAG Engine"]
    end

    %% Final Output Layer
    subgraph "Phase 3: Actionable Output"
        O1["🇧🇩 Contextual Bengali Advice"]
        O2["📊 Market Buy/Sell Decision"]
        O3["🚜 Precision Field Maps"]
    end

    %% Relationships
    U1 & U2 & U3 --> G1
    G1 --> G2
    G2 <--> G3
    G2 --> O1 & O2 & O3

    style G2 fill:#e74c3c,stroke:#fff,color:#fff,stroke-width:2px
```

---

## 2. AI Component Architecture (Internal Deep-Dive)
We integrate state-of-the-art AI-native tools and agentic workflows to handle the complexity of precision agriculture.

*   **Model Selection**: `google/gemini-2.5-flash` for high-speed multi-modal reasoning.
*   **RAG (Retrieval-Augmented Generation)**: Uses `text-embedding-004` to index 10k+ pages of BARI/DAE technical documentation into **Supabase pgvector**.
*   **MCP Style Integration**: Standardized Edge Functions act as tools for the model, allowing it to "sense" (Satellite), "analyze" (Market), and "see" (Vision).

```mermaid
graph TD
    %% AI Orchestration
    subgraph "AI Agentic Workflow"
        LLM["🤖 Gemini 2.5 Flash Agent"]
        Router{"🛠️ Tool Router"}
    end

    %% Tools & Knowledge
    subgraph "Context & Memory"
        VectorDB[("📦 pgvector<br/>(BARI/DAE Knowledge)")]
        VisionAPI["👁️ Vision Engine<br/>(OCR/Disease)"]
        MarketAPI["📈 Market Price Stream"]
    end

    %% Connections
    LLM <--> Router
    Router -->|Query| VectorDB
    Router -->|Analyze Image| VisionAPI
    Router -->|Fetch Prices| MarketAPI
    
    VectorDB -->|Retrieved Context| LLM
    VisionAPI -->|Visual Findings| LLM
    MarketAPI -->|Live Deltas| LLM
```

---

## 3. Data Flow and Decision Logic
Judges can verify our **AI Reasoning** through these clear decision paths and safety guardrails.

### Decision Path Example (Pest Risk)
1.  **Ingestion**: Live humidity (>80%) and temp (28°C) data fetched via Weather API.
2.  **Processing**: Logic Engine identifies a high risk for *Rice Blast* fungus.
3.  **Cross-Verification**: RAG checks historical pest heatmaps in the same district.
4.  **Guardrail Layer**: If confidence is <70%, the system forces an "Expert Review Required" flag.

```mermaid
graph TD
    %% Decision Pipeline
    DP1["📥 Data Ingestion<br/>(Sensors/User)"] --> DP2["📑 Pre-processing<br/>(Cleaning)"]
    DP2 --> DP3{{"🛡️ Hallucination Check<br/>& Safety Guardrail"}}
    DP3 -->|Safe| DP4["🧠 AI Synthesis"]
    DP3 -->|Unsafe| DP5["🚫 Filter/Reject"]
    
    DP4 --> DP6["🇧🇩 Bengali Formatting"]
    DP6 --> DP7["📤 Output Delivery"]

    %% Ethics Note
    style DP3 fill:#f39c12,stroke:#333
    note["<b>Ethics & Privacy Layer:</b><br/>PII Anonymization & Factual<br/>Attribution (BARI/DAE)"]
    DP3 -.-> note
```

---

## 4. Technology Stack (Layered View)
Our stack is built for durability, scalability, and extreme performance.

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS (v0/Lovable optimized) |
| **Backend** | Supabase Edge Functions (Deno), Node.js, FastAPI |
| **Data Layer** | Supabase PostgreSQL, **pgvector**, NASA Satellite API |
| **AI/ML Layer** | **Gemini 2.5 Flash**, text-embedding-004, custom RAG |

---

> [!IMPORTANT]
> **MXB2026 Judge Note**: This diagram set illustrates the **foundations, wiring, and plumbing** of the Agri Shokti platform. Every AI-generated output is grounded in BARI research data with a traceable attribution log preserved in our `rag_interactions` table.
