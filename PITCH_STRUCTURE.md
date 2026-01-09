# Agri-Shokti Bangla — Final Pitch Structure

Audience: Judges evaluating technical depth (AI logic, prompts, system architecture).  
Goal: A succinct, slide-by-slide pitch deck that highlights the product, technical design, and verifiable implementation in your repo.

Estimated deck: 12–16 slides (10–12 minutes). Aim for clarity: 1 slide / minute.

---

Slide 1 — Title
- Title: "Agri-Shokti Bangla"
- Subtitle: Short tagline (e.g., "AI-assisted, Bengali-first agriculture advisory")
- Presenters + contact
- Repo link: https://github.com/yasar-sys/agri-shokti-bangla
- Speaker note: One-line mission and one tech highlight (Supabase + Vite + AI layer).

Slide 2 — Problem
- Bullet problems faced by target users (farmers): information gap, language barrier, local practices.
- Short statistic or anecdote (from PROJECT_DOCUMENTATION.md if available).
- Speaker note: Emphasize why localized, Bengali-first AI matters.

Slide 3 — Solution
- Product summary: interactive web app + AI assistant for Bengali farming advice.
- Key capabilities: Q&A, localized recommendations, image or text inputs (if implemented).
- Quick visual mock or screenshot (use `index.html`/`public` assets).
- Reference: [README.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/README.md)

Slide 4 — Demo (live or recorded)
- Quick flows to demo: ask question in Bengali → retrieve contextual answer → show data saved (Supabase).
- Files to run demo / start server: `package.json` scripts and `README.md`.
  - [package.json](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/package.json)
  - [README.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/README.md)
- Speaker note: If offline demo, include short recorded clip or screenshots from `public/`.

Slide 5 — Tech stack (short)
- Frontend: Vite + TypeScript + Tailwind (evidence: `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`)
  - [vite.config.ts](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/vite.config.ts)
  - [tailwind.config.ts](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/tailwind.config.ts)
- Backend / DB: Supabase folder present — Supabase used for auth, DB, and/or storage
  - [supabase/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/supabase)
- Deployment: Vercel config present (`vercel.json`)
  - [vercel.json](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/vercel.json)
- Build tools & config: `bun.lockb`, `package-lock.json`, `postcss.config.js`, linting config
  - [package-lock.json](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/package-lock.json)

Slide 6 — System architecture (diagram)
- Visual elements to include:
  - User (browser)
  - Frontend (Vite app)
  - API / Serverless functions (if present) or direct client → Supabase
  - Supabase (Postgres + Storage + Auth + Vector/Embeddings if used)
  - Vector DB or embedding store (Supabase/pgvector or external)
  - LLM provider(s) (OpenAI, Anthropic, or self-hosted Llama2)
  - Optional caching / CDN (Vercel)
- Data flow (short): User input → frontend → retrieval (vector DB) → LLM (prompt + retrieved context) → response → store interaction in Supabase
- Speaker note: Keep diagram simple, use arrows and colours to show synchronous vs async flows.

Slide 7 — AI Logic (detailed)
- Where/How LLMs are used:
  - Retrieval-Augmented Generation (RAG) recommended: use embeddings + vector retrieval to ground answers in docs.
  - Candidate LLMs:
    - Cloud: OpenAI GPT-4o/4.1 or GPT-4 Turbo — high-quality LLM via API.
    - Claude 2/3 for safety-conscious flows (optional).
    - Local: Llama2 / Mistral via hosted inference for cost-control or offline.
  - Embeddings:
    - OpenAI embeddings or local embedding models (e.g., sentence-transformers).
  - Vector DB:
    - Supabase (pgvector) or dedicated vector DB (Pinecone/Weaviate/Redis Vector).
- Repo evidence & hooks:
  - `supabase/` folder indicates DB usage and is the natural home for storing embeddings and logs.
  - `PROJECT_DOCUMENTATION.md` likely describes architecture decisions — cite it.
    - [PROJECT_DOCUMENTATION.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/PROJECT_DOCUMENTATION.md)
- Speaker note: Explain trade-offs: cost vs latency vs control; recommend RAG for accuracy & provenance.

Slide 8 — Prompt design & provenance
- Show three prompt templates (Ideation, Architecture, Coding) — provide exact templates you used (example templates below).
- Emphasize provenance: include retrieved passages + source citations in LLM prompt; show how you store the retrieval trace in Supabase.
- Example prompt templates (use as slide content + appendix):
  - Ideation prompt (for brainstorming features):
    - "You are an expert in Bangladeshi smallholder agriculture. Generate 6 concise features for a Bengali-first crop advisory web app targeted at rice and vegetable farmers, prioritized by impact and feasibility."
  - Architecture prompt:
    - "Given a frontend built with Vite + TypeScript and Supabase for DB/auth, propose a scalable RAG architecture to serve Bengali-language queries, including API endpoints, background embedding pipelines, and safety filters."
  - Coding prompt:
    - "Write a TypeScript function that takes user text, calls the embedding API, upserts embedding into Supabase pgvector, and returns the inserted row id. Include error handling and types."
- Speaker note: For judges, be ready to show real prompts used (put them in appendix or notebook).

Slide 9 — Implementation details & pointers to code
- Key files and what they contain:
  - [README.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/README.md) — Getting started, dev commands
  - [PROJECT_DOCUMENTATION.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/PROJECT_DOCUMENTATION.md) — In-depth docs, architecture notes
  - `src/` — core frontend code (link)
    - [src/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/src)
  - `supabase/` — DB schema, functions, migrations
    - [supabase/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/supabase)
  - `index.html` / `public/` — static assets and front matter
    - [index.html](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/index.html)
    - [public/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/public)
  - Configs: `vite.config.ts`, `tailwind.config.ts`, `vercel.json`
- Speaker note: Keep links on slide; mention you will open code for any asked section.

Slide 10 — Security, privacy, and safety
- Data handling: how user data is stored (Supabase), what PII is collected, retention policy (show in docs if present).
- Safety: LLM guardrails, prompt-based constraints, content filters (mention concrete filters or middleware if implemented).
- Speaker note: If not implemented, present a mitigation plan and where it will be added in the repo (e.g., serverless middleware).

Slide 11 — Performance & cost considerations
- Latency sources: embedding generation, vector retrieval, LLM inference.
- Cost trade-offs: inference provider, model size, caching.
- Scaling: background jobs for embedding ingestion vs real-time.

Slide 12 — Roadmap & metrics
- Short-term: improve prompt templates, add more seed data, implement analytics.
- Mid-term: offline-capable local LLM for low-connectivity users, SMS integration.
- Success metrics: DAU, answer accuracy (human eval), reduction in farmer errors.

Slide 13 — Team & ask
- Team members + roles (authors listed in repo or your team slide).
- What you want from judges: mentorship, compute credit, partner farmers, grant funding.

Slide 14 — Appendix A: Prompts (full)
- Include full prompt history (exact prompts used for architecture, generation & code).
- State how prompts are versioned and stored (e.g., in repo or in Supabase).

Slide 15 — Appendix B: System architecture diagram (detailed)
- Provide an expanded diagram for technical reviewers: API contract, table schemas (refer to supabase migrations if present), event flows for embedding ingestion.

Slide 16 — Appendix C: Code references & run instructions
- Quick start:
  - Clone repo
  - Install: npm install (or bun install if used)
  - Environment: refer to `.env` (do NOT upload secrets)
    - [.env](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/.env) (example)
  - Dev run: script from [package.json](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/package.json)
- Files to open during Q&A:
  - [PROJECT_DOCUMENTATION.md](https://github.com/yasar-sys/agri-shokti-bangla/blob/main/PROJECT_DOCUMENTATION.md)
  - [src/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/src)
  - [supabase/](https://github.com/yasar-sys/agri-shokti-bangla/tree/main/supabase)

---

Appendix: Short mapping of repository files (quick reference)
- .env — environment variables (local secrets)  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/.env
- README.md — overview and start instructions  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/README.md
- PROJECT_DOCUMENTATION.md — long-form project docs, architecture notes  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/PROJECT_DOCUMENTATION.md
- src/ — frontend application source  
  https://github.com/yasar-sys/agri-shokti-bangla/tree/main/src
- supabase/ — DB schema, migrations, functions  
  https://github.com/yasar-sys/agri-shokti-bangla/tree/main/supabase
- public/ & index.html — static assets and entry page  
  https://github.com/yasar-sys/agri-shokti-bangla/tree/main/public  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/index.html
- vite.config.ts, tailwind.config.ts, tsconfig*.json — build & styling configs  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/vite.config.ts  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/tailwind.config.ts
- vercel.json — deployment configuration for Vercel  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/vercel.json
- package.json, lock files — dependencies & scripts  
  https://github.com/yasar-sys/agri-shokti-bangla/blob/main/package.json

---

Notes for preparing the deck and Q&A
- Bring: (a) architecture diagram slide, (b) one code-snippet slide showing embedding + retrieval + prompt, (c) prompt history slide with examples.
- Be ready to answer:
  - Which LLM(s) did you use and why (cost/quality/privacy)?
  - How do you ensure factuality / provenance in answers? (Answer: RAG + citations + logging in Supabase)
  - Show the exact prompt for a critical flow (have it in Appendix).
- Practical tip: keep the architecture diagram simple on the main slide; present the detailed diagram only if asked.

---

If you want, I can:
- generate slide-by-slide speaker notes,
- produce the architecture diagram (SVG/PNG),
- extract likely prompt history from your repo and format prompts into the Appendix,
- convert this structure into a Google Slides / PowerPoint outline.

Which of these would you like me to do next?
