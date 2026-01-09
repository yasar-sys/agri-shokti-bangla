# AI Logic & Workflow — Image → Gemini Vision → Outcome
(বাংলায় ব্যাখ্যা ও উদাহরণসহ)

উদ্দেশ্য: ব্যবহারকারী যদি ছবি আপলোড করে (ফসল, পাতা, মাটি ইত্যাদি), তাতে কীভাবে Gemini Vision/ভিজন মডেল এবং RAG+LLM স্তরের সাথে মিলিয়ে ফলাফল (diagnosis, recommendations, citations) তৈরি করবে — পুরো এন্ড-টু-এন্ড ফ্লো।

---

## সারসংক্ষেপ (1 লাইন)
User uploads image → Vision model (Gemini Vision) does perception (detection/OCR/segmentation) → Extract structured observations → Retrieve relevant docs from vector DB (Supabase pgvector) → Compose RAG prompt → LLM generates Bengali answer with citations → Save interaction, metrics, and feedback.

---

## High-level flowchart (Mermaid)
```mermaid
flowchart TD
  U[User (browser / mobile app)]
  U --> |image / text| FE(Frontend - Vite App)
  FE --> API[Serverless API / Edge fn]
  API --> GV[Gemini Vision (image analysis)]
  GV --> Obs[Structured Observations]
  Obs --> Emb[(Embed obs + text)]
  Emb --> VB[Vector DB (Supabase pgvector)]
  API --> KB[Knowledge base / docs (PROJECT_DOCUMENTATION, manuals)]
  KB --> VB
  VB --> RET[Retriever: nearest passages]
  RET --> RAG_PROMPT[Build RAG prompt (obs + passages)]
  RAG_PROMPT --> LLM[Text LLM (GPT/Claude/Llama)]
  LLM --> Ans[Answer (Bengali) + citations + confidence]
  Ans --> FE
  FE --> U
  API --> Logs[Supabase - logs & provenance]
  Logs --> Analytics[Metrics & human review]
```

---

## ধাপে ধাপে ব্যাখ্যা

1. Frontend
   - ব্যবহারকারী ছবি/টেক্সট সাবমিট করে।
   - Frontend কাঁচা ছবি/মেটাডাটা (GPS, timestamp, user_id) API-তে পাঠায়।

2. API / Edge Function
   - API ভেরিফাই করে auth (Supabase auth)।
   - ছবিটি সরাসরি Gemini Vision এ পাঠানো যেতে পারে বা স্থানীয় প্রি-প্রসেসিং (resize, compress) করা যেতে পারে।

3. Gemini Vision (Image perception)
   - প্রধান কাজ:
     - Object detection (leaf, fruit, pest)
     - Disease spotting / segmentation (blight spots, lesions)
     - OCR (if user uploaded label / packaging)
     - Scene metadata (soil moisture clues, staging)
   - Output: structured JSON observations, উদাহরণ:
     {
       "detections": [
         {"label":"rice_leaf","bbox":[...],"confidence":0.92},
         {"label":"brown_spot","bbox":[...],"confidence":0.88}
       ],
       "segmentation": {...},
       "ocr_text": "খাদ্য লেবেল ...",
       "image_quality": "good"
     }

4. Create textual observation
   - Structured observations কে মানব-পাঠ্য রূপে রূপান্তর:
     - "Image shows rice leaf with multiple brown circular lesions (confidence 0.88). No visible pests. Photo taken at 2025-12-01 in field X."

5. Embeddings & Retrieval (RAG)
   - Observation text + user question → embeddings (OpenAI embeddings বা local model)।
   - Upsert embeddings into Supabase pgvector (optionally, background job).
   - Retrieve top-K relevant passages from Knowledge Base (e.g., PROJECT_DOCUMENTATION.md, local crop manuals, previous validated Q&A).

6. Build RAG prompt
   - Prompt structure:
     - System: "You are an expert Bengali-language agronomist. Use ONLY the provided passages for factual claims. If uncertain, say so and recommend tests."
     - Context: include retrieved passages with source links.
     - Observation: include Gemini Vision output (structured + summary).
     - User question: original user query (if any).
     - Instruction: produce diagnosis, steps, severity score (0-100), confidence, and 2 actionable recommendations, plus citations.

7. LLM Generation
   - Use GPT/Gemini/Claude/Llama as required.
   - Output format (structured):
     {
       "diagnosis": "Brown spot disease (Bipolaris oryzae) - likely",
       "severity": "moderate (45%)",
       "recommendations": [
         "Remove badly infected leaves and burn them.",
         "Apply fungicide X at Y dosage (source: doc1)"
       ],
       "confidence": 0.72,
       "sources": [
         {"title":"Rice Disease Manual","url":"...", "passage_id":"..."}
       ]
     }

8. Provenance & Storage
   - Save: image hash, GV observations, retrieved passages (ids), final LLM response, model & prompts, timestamp, user id → Supabase `interactions` table.
   - This enables audits, human review, and model improvement.

9. Feedback & Human-in-the-loop
   - Provide user a feedback button (Was this helpful? yes/no).
   - Low-confidence responses flagged for agronomist review; reviewed corrections used to fine-tune retrieval ranking / prompt templates.

---

## Example prompts

- Gemini Vision instruction (meta prompt sent to vision API):
  "Analyze the image. Detect plant species, leaf lesions, and pests. Return JSON with {detections:[], segmentation:{}, ocr_text:'', image_quality:''}. For each detection include label, bbox, and confidence."

- RAG system prompt (to LLM):
  "System: আপনি একজন বাংলা ভাষার কৃষি বিশেষজ্ঞ। নীচের 'OBSERVATION' এবং 'CONTEXT' ব্যবহার করে শুধু নিশ্চিত তথ্য বলুন। যদি তথ্য অনিশ্চিত হয়, স্পষ্টভাবে জানাবেন। RESPONSE STRUCTURE: diagnosis, severity(%) , steps (short), confidence(0-1), sources(list)."

- Example RAG prompt payload (abbreviated):
  OBSERVATION:
  "Rice leaf with brown circular lesions (conf 0.88)."
  CONTEXT PASSAGES:
  "[1] Rice Disease Manual — Brown spot caused by Bipolaris..."
  USER QUESTION:
  "কি করবো? কী ঔষধ লাগবে?"

---

## Outcome examples (UI-friendly)

- Short answer (Bengali):
  "সম্ভবত brown spot রোগ (Bipolaris)। গুরুতর নয়; অসুস্থ পাতা সরিয়ে ফেলুন এবং 7 দিনে Fungicide XYZ (active: propiconazole) স্প্রে করুন। উৎস: Rice Disease Manual [link]."

- Structured response for frontend to display:
  {
    "title":"সম্ভবত: Brown spot (Bipolaris)",
    "severity":"moderate",
    "confidence":0.72,
    "actions":[
      {"type":"manual","text":"সংক্রমিত পাতা সরান ও পোড়ান"},
      {"type":"chemical","text":"Propiconazole 25% SC — 1ml/L, spray"}
    ],
    "sources":[{"title":"Rice Disease Manual","url":"..."}]
  }

---

## Safety, limits, and best-practices
- Always show confidence and citations.
- If confidence < threshold (e.g., 0.6) show "Consult expert" and queue for review.
- Never provide restricted chemical dosages beyond vetted sources; show source links.
- Keep PII out of exported logs or anonymize.

---

## Evaluation metrics (for judges)
- Accuracy rate (human-verified) on sample set (N examples).
- Precision/Recall for disease detection (vision model).
- Average response latency (ms).
- User satisfaction (thumbs-up %).

---

## Implementation pointers (repo-specific)
- Use `supabase/` for schema: add `interactions` table with columns: user_id, image_url, gv_output JSON, passages JSON, llm_output JSON, prompt_text, model, confidence, created_at.
- Keep prompt templates in repo (e.g., `src/prompts/`) and version them.
- Store small thumbnails and hashes rather than full images for reproducibility.

---

আপনি চাইলে আমি এই ফাইল থেকেই:
- একটি স্লাইড-উপযোগী SVG আর্কিটেকচার ডায়াগ্রাম তৈরি করে দেবো,
- বা Gemini Vision → RAG → LLM এর জন্য production-ready TypeScript কোড স্নিপেট (API route + Supabase upsert) লিখে দিতে পারি।
- কোনটি করবেন?
