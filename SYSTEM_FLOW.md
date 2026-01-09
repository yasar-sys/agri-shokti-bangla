# System Architecture & Technical Ecosystem

This flowchart illustrates the multi-dimensional data flow of **Agri Shokti**, showing how Generative AI, Predictive Analytics, and Remote Sensing work together.

## Comprehensive Logic Flow (n8n Style)

```mermaid
graph TD
    %% User Inputs Hub
    subgraph "Farmer Experience (Mobile/Web)"
        Input_UI[("📲 App Interface")]
        Action_Vision{{"📸 Capture Leaf/Sack"}}
        Action_Query{{"💬 Ask AgriBrain"}}
        Action_Sensing{{"🛰️ View Field Health"}}
        Action_Params{{"🔢 Input Area/Land"}}
    end

    %% Intelligence Layer
    subgraph "Logic Processing Gateway"
        Engine_GenAI["🤖 Generative AI<br/>(LLM Gateway)"]
        Engine_Predictive["📈 Predictive Analytics<br/>(Risk Models)"]
        Engine_Sensing["📡 Remote Sensing<br/>(NDVI/Satellite)"]
        Engine_Spatial["📍 Spatial Logic<br/>(TSP/Drone)"]
    end

    %% Data & Knowledge
    subgraph "Data Backbone"
        Vector_DB[("📂 Doc Embeddings")]
        Weather_API[("☁️ Live Weather")]
        Market_API[("🌾 Price Feed")]
        NASA_API[("🔭 NASA / Sentinel")]
    end

    %% Flow Connections
    Action_Vision --> Engine_GenAI
    Action_Query --> Engine_GenAI
    
    Action_Sensing --> Engine_Sensing
    Action_Params --> Engine_Predictive
    
    Engine_GenAI <--> Vector_DB
    Engine_GenAI <--> Weather_API
    
    Engine_Predictive <--> Market_API
    Engine_Sensing <--> NASA_API
    
    %% Cross-Logic Synthesis
    Engine_Sensing --> Engine_Spatial
    Engine_Predictive -->|Fertility Data| Engine_GenAI
    
    Engine_Spatial --> Input_UI
    Engine_GenAI --> Input_UI
    Engine_Sensing --> Input_UI

    %% Styling Elements
    style Engine_GenAI fill:#e74c3c,stroke:#fff,color:#fff
    style Engine_Predictive fill:#2ecc71,stroke:#333
    style Engine_Sensing fill:#3498db,stroke:#fff,color:#fff
    style Engine_Spatial fill:#f1c40f,stroke:#333
```

## The Four Intelligence Hubs

1.  **Generative AI Hub**: Powered by Gemini 2.5 Flash. It provides the "human-to-machine" interface, translating technical knowledge into actionable Bengali advice.
2.  **Predictive Hub**: Uses mathematical models for NPK nutrient balancing, diesel fuel optimization, and harvest risk scores based on live weather deltas.
3.  **Sensing Hub**: Converts raw satellite spectral data from NASA/Sentinel into simplified health scores (NDVI), allowing farmers to "see" crop stress before it's visible to the naked eye.
4.  **Spatial Hub**: Optimizes movement. Whether it's drone spray paths using TSP algorithms or calculating the most efficient harvest route across multiple land parcels.
