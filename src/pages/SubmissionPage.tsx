import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubmissionPage = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# 📋 AgriShokti - MXB2026 Project Submission

## PART A — COMPLETE SUBMISSION

### 1. Basic Project Information

| Field | Entry |
|-------|-------|
| **Project Name** | AgriShokti (কৃষিশক্তি - "Agricultural Power") |
| **Team Name** | TEAM_NEWBIES |
| **Submission ID** | MXB2026-Mymensingh-TEAM_NEWBIES-AgriShokti |
| **Domain** | AgriTech |
| **Challenge Selected** | AI-Powered Agricultural Assistant for Bangladesh |
| **Location** | Mymensingh |
| **Submission Type** | Final |

---

### 2. Team Information

| Item | Details |
|------|---------|
| **Team Leader** | Samin Yasar, saminyasar@mec.edu.bd |
| **Team Members** | Samin Yasar – Team Lead, Prompt Engineer & AI Integration Specialist |
| | Mahmud Niloy – Developer |
| | Rahiatul Jannat – Developer |
| | Maisha Osman Umama – Developer |
| | Neshat Sultana Keya – Agricultural Expert |
| **Institution(s)** | Mymensingh Engineering College, Gazipur Agricultural University |
| **Live Demo** | https://agri-shokti-ai.vercel.app |

---

### 3. One-Line Pitch

> **We are building AgriShokti for Bangladesh's 35+ million smallholder farmers to solve the problems of crop disease identification, market price uncertainty, and lack of accessible agricultural knowledge using AI-powered image recognition, RAG-enhanced chatbot, and real-time data analytics.**

---

### 4. Problem Statement (Design Thinking)

**Problem (2–3 sentences):**
Bangladesh's 35+ million farmers lose ৳12,000+ crore annually due to crop diseases, misinformation, and poor market timing. Most farmers lack access to agricultural experts, face language barriers with technology, and cannot identify crop diseases early enough to prevent losses. This impacts food security, rural livelihoods, and the national economy.

**Why Existing Solutions Fall Short:**
- Government extension services are understaffed (1 officer per 1,500+ farmers)
- Existing apps are in English, not Bengali with voice support
- No integrated platform combines disease detection, market prices, weather, and expert advice
- Offline access is non-existent in rural areas with poor connectivity

---

### 5. Solution Overview

**What We Built:**
AgriShokti is a Progressive Web Application (PWA) that provides AI-powered agricultural assistance entirely in Bengali. Using Google Gemini AI with RAG (Retrieval-Augmented Generation), farmers can photograph crops for instant disease diagnosis, ask questions via voice in Bengali, get real-time market prices with AI forecasts, receive weather-based farming recommendations, and access government schemes—all working offline in rural areas.

**Key Features:**
| Feature | Description |
|---------|-------------|
| 📸 AI Disease Detection | Camera-based crop disease identification with treatment recommendations |
| 💬 Bengali Voice Chatbot | RAG-powered AI assistant with voice input/output in Bengali |
| 📈 Smart Market Prices | Real-time prices with AI-powered forecast and trend analysis |
| 🌤️ Climate Alerts | Weather warnings with agriculture-specific recommendations |
| 📅 Farming Calendar | Personalized crop scheduling based on land size and crop type |
| 🔍 Anti-Fake Fertilizer | Scan fertilizer bags to verify authenticity |
| 🗺️ Pest Heatmap | Regional pest outbreak visualization and predictions |
| 🛰️ Satellite NDVI | Crop health monitoring via satellite imagery |
| 🧮 NPK Calculator | Precise fertilizer requirement calculations |
| 🏛️ Government Services | One-stop access to schemes, subsidies, and contacts |
| 👥 Community Forum | Peer-to-peer knowledge sharing with expert verification |
| 🎮 Gamification | XP points and achievements to encourage engagement |

---

### 6. AI & System Architecture

**System Overview:**
\`\`\`
User Input (Voice/Text/Image) 
    → React PWA Frontend 
    → Supabase Edge Function 
    → [RAG: Vector Search on Knowledge Base] 
    → Google Gemini 2.5 Flash 
    → Contextualized Response 
    → Bengali Voice/Text Output
\`\`\`

**AI Components Used:**
- ☑️ LLMs (Google Gemini 2.5 Flash via Lovable AI Gateway)
- ☑️ RAG (pgvector-based retrieval from agricultural knowledge base)
- ☑️ ML models (Vision AI for disease detection)
- ☑️ Automation (Real-time weather alerts, scheduled farming reminders)

**Tech Stack:**

| Layer | Tools |
|-------|-------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Shadcn/UI, Vite, Mapbox GL |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions), Lovable Cloud |
| **AI / ML** | Google Gemini 2.5 Flash, pgvector for embeddings, Lovable AI Gateway |
| **Data** | PostgreSQL with RLS, pgvector for semantic search |
| **APIs** | Open-Meteo (Weather), OpenStreetMap (Location), Mapbox (Maps) |

---

### 7. Data Strategy

**Data Sources:**
| Source | Usage |
|--------|-------|
| BRRI & BARI | Bangladesh Rice/Agricultural Research Institute data |
| DAE | Department of Agricultural Extension guidelines |
| PlantVillage Dataset | Disease detection training data |
| Open-Meteo | Weather forecasting |
| SoilGrids | Soil quality data |
| Sentinel/Landsat | Satellite imagery for NDVI |
| FAO | International agricultural best practices |

**Ethics & Privacy:**
- Row-Level Security (RLS) on all user data tables
- User data never shared with third parties
- Anonymous usage analytics only
- Bengali language consent forms
- Data stored in Supabase with encryption at rest
- GDPR-compliant data handling practices

---

### 8. Demo & Proof of Work (Mandatory)

| Item | Link |
|------|------|
| **Live Application** | https://agrishokti.aizanbd.com |

---

### 9. Impact & Value

**Who Benefits:**
- **Primary:** 35+ million smallholder farmers in Bangladesh
- **Secondary:** Agricultural extension officers, agricultural students, researchers, government policymakers

**Expected Impact:**
| Metric | Expected Improvement |
|--------|---------------------|
| Disease Detection Time | From 2-3 days (extension officer visit) → **< 1 minute** |
| Crop Loss Reduction | Estimated **15-25% reduction** through early detection |
| Market Information Access | From limited/delayed → **Real-time with AI forecasts** |
| Expert Consultation | From 1:1500 ratio → **Unlimited AI access** |
| Language Barrier | **100% Bengali** with voice support for illiterate users |
| Cost Savings | Estimated **৳5,000-10,000/farmer/year** through optimized inputs |

---

### 10. Scalability & Feasibility

**How This Scales:**

| Dimension | Scalability Plan |
|-----------|------------------|
| **Technical** | PWA works on any device, serverless backend auto-scales, CDN for static assets |
| **Geographic** | Knowledge base can be extended to other South Asian countries (India, Nepal, Sri Lanka) |
| **Cost** | Pay-per-use AI model, free tier covers 80% of users, premium for power users |
| **Linguistic** | Architecture supports adding Hindi, Tamil, and other regional languages |

**Next 6–12 Months:**
1. Partner with DAE for official data integration
2. Integrate SMS alerts for users without smartphones
3. Add IoT sensor integration for soil moisture monitoring
4. Expand knowledge base with 5,000+ articles
5. Pilot in 5 Upazilas with 10,000+ farmers
6. Develop marketplace for farmer-to-buyer connections

---

### 11. Sustainability Model (Light Business Model Canvas)

| Area | Description |
|------|-------------|
| **Value Proposition** | Free AI-powered agricultural assistant in Bengali, reducing crop losses and increasing farmer income |
| **Target Users** | Small/medium farmers, agricultural officers, agri-businesses |
| **Adoption Model** | Freemium: Core features free, premium for advanced analytics & priority support |
| **Revenue Streams** | 1. Premium subscriptions (৳99/month) 2. B2B API for agri-companies 3. Government partnerships 4. Sponsored marketplace listings |
| **Sustainability** | Partner with BRAC, Grameen, DAE for distribution; minimal marginal cost per user due to AI efficiency |

---

### 12. Innovation Edge (10× Thinking)

**What makes AgriShokti 10× better:**

1. **First Bengali Voice-First Agricultural AI**: No other solution offers complete Bengali voice input/output with RAG-powered accuracy

2. **Unified Platform**: Competitors offer fragmented solutions; we integrate disease detection + market + weather + community + government services

3. **RAG-Powered Accuracy**: Unlike generic chatbots, our RAG system retrieves from a curated agricultural knowledge base, ensuring accurate, context-aware responses

4. **Offline-First PWA**: Works in rural areas with poor connectivity—critical for 60% of target users

5. **Gamification for Engagement**: Unique XP/achievement system keeps farmers engaged and learning

6. **Anti-Fake Fertilizer Scanner**: First-of-its-kind feature to combat the ৳2,000 crore fake fertilizer market

---

### 13. Ethics, Safety & Responsibility

| Concern | Mitigation |
|---------|------------|
| **AI Hallucination** | RAG grounds responses in verified agricultural data; clear disclaimers for recommendations |
| **Bias** | Knowledge base reviewed by agricultural experts; diverse training data |
| **Data Privacy** | RLS policies, encrypted storage, no data selling |
| **Misinformation** | Expert verification badges, AI moderation on community posts |
| **Accessibility** | Voice-first design for low-literacy users, high-contrast modes |
| **Dependency Risk** | Educational content empowers farmers, not just answers queries |

---

### 14. Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Now (MVP)** | Dec 2024 | ✅ Disease detection, Chat AI, Market prices, Weather, Calendar, PWA |
| **Next (Growth)** | Q1-Q2 2025 | SMS integration, IoT sensors, 5 Upazila pilot, Marketplace beta |
| **Future (Scale)** | Q3-Q4 2025 | India/Nepal expansion, Drone integration, 100k+ users, Government partnership |

---

### 15. Open Source Declaration

| Item | Response |
|------|----------|
| **Open Source?** | Yes |
| **License** | MIT License |
| **Repository** | https://github.com/team_newbies/agri-shokti-ai |

---

### 16. Final Checklist

- ☑️ Naming convention correct (MXB2026-Mymensingh-TEAM_NEWBIES-AgriShokti)
- ☑️ Drive public [To be confirmed]
- ☑️ Demo accessible (https://agri-shokti-ai.vercel.app)
- ☑️ AI logic explained (RAG pipeline with Gemini 2.5 Flash)
- ☑️ Full technical documentation available
- ☑️ Live working prototype deployed

---

**মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি** 🌾

© 2024 TEAM_NEWBIES - AgriShokti
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AgriShokti_MXB2026_Submission.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
              <Download className="w-4 h-4 mr-2" />
              Download MD
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print to PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
        <article className="prose prose-sm dark:prose-invert max-w-none print:prose-black">
          
          {/* Title */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-foreground print:text-black mb-2">
              📋 AgriShokti - MXB2026 Project Submission
            </h1>
            <p className="text-muted-foreground print:text-gray-600">
              মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">1. Basic Project Information</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium w-1/3">Project Name</td><td>AgriShokti (কৃষিশক্তি - "Agricultural Power")</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Team Name</td><td>TEAM_NEWBIES</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Submission ID</td><td>MXB2026-Mymensingh-TEAM_NEWBIES-AgriShokti</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Domain</td><td>AgriTech</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Challenge Selected</td><td>AI-Powered Agricultural Assistant for Bangladesh</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Location</td><td>Mymensingh</td></tr>
                <tr><td className="py-2 font-medium">Submission Type</td><td>Final</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">2. Team Information</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium w-1/3">Team Leader</td><td>Samin Yasar, saminyasar@mec.edu.bd</td></tr>
                <tr className="border-b">
                  <td className="py-2 font-medium align-top">Team Members</td>
                  <td>
                    <ul className="list-none p-0 m-0 space-y-1">
                      <li>Samin Yasar – Team Lead, Prompt Engineer & AI Integration Specialist</li>
                      <li>Mahmud Niloy – Developer</li>
                      <li>Rahiatul Jannat – Developer</li>
                      <li>Maisha Osman Umama – Developer</li>
                      <li>Neshat Sultana Keya – Agricultural Expert</li>
                    </ul>
                  </td>
                </tr>
                <tr className="border-b"><td className="py-2 font-medium">Institution(s)</td><td>Mymensingh Engineering College, Gazipur Agricultural University</td></tr>
                <tr><td className="py-2 font-medium">Live Demo</td><td>https://agri-shokti-ai.vercel.app</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">3. One-Line Pitch</h2>
            <blockquote className="border-l-4 border-primary pl-4 italic bg-muted/30 p-4 rounded-r print:bg-gray-100">
              We are building AgriShokti for Bangladesh's 35+ million smallholder farmers to solve the problems of crop disease identification, market price uncertainty, and lack of accessible agricultural knowledge using AI-powered image recognition, RAG-enhanced chatbot, and real-time data analytics.
            </blockquote>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">4. Problem Statement</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Problem (2–3 sentences):</h3>
                <p className="text-muted-foreground print:text-gray-700">
                  Bangladesh's 35+ million farmers lose ৳12,000+ crore annually due to crop diseases, misinformation, and poor market timing. Most farmers lack access to agricultural experts, face language barriers with technology, and cannot identify crop diseases early enough to prevent losses. This impacts food security, rural livelihoods, and the national economy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Why Existing Solutions Fall Short:</h3>
                <ul className="list-disc pl-5 text-muted-foreground print:text-gray-700 space-y-1">
                  <li>Government extension services are understaffed (1 officer per 1,500+ farmers)</li>
                  <li>Existing apps are in English, not Bengali with voice support</li>
                  <li>No integrated platform combines disease detection, market prices, weather, and expert advice</li>
                  <li>Offline access is non-existent in rural areas with poor connectivity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">5. Solution Overview</h2>
            <p className="mb-4 text-muted-foreground print:text-gray-700">
              AgriShokti is a Progressive Web Application (PWA) that provides AI-powered agricultural assistance entirely in Bengali. Using Google Gemini AI with RAG (Retrieval-Augmented Generation), farmers can photograph crops for instant disease diagnosis, ask questions via voice in Bengali, get real-time market prices with AI forecasts, receive weather-based farming recommendations, and access government schemes—all working offline in rural areas.
            </p>
            <h3 className="font-semibold mb-2">Key Features:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">📸 AI Disease Detection</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">💬 Bengali Voice Chatbot</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">📈 Smart Market Prices</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🌤️ Climate Alerts</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">📅 Farming Calendar</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🔍 Anti-Fake Fertilizer</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🗺️ Pest Heatmap</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🛰️ Satellite NDVI</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🧮 NPK Calculator</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🏛️ Government Services</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">👥 Community Forum</div>
              <div className="p-2 bg-muted/30 rounded print:bg-gray-100">🎮 Gamification</div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">6. AI & System Architecture</h2>
            <div className="bg-muted/30 p-4 rounded font-mono text-xs mb-4 print:bg-gray-100">
              <pre className="whitespace-pre-wrap">
{`User Input (Voice/Text/Image) 
    → React PWA Frontend 
    → Supabase Edge Function 
    → [RAG: Vector Search on Knowledge Base] 
    → Google Gemini 2.5 Flash 
    → Contextualized Response 
    → Bengali Voice/Text Output`}
              </pre>
            </div>
            <h3 className="font-semibold mb-2">AI Components Used:</h3>
            <ul className="list-none space-y-1 mb-4">
              <li>☑️ LLMs (Google Gemini 2.5 Flash via Lovable AI Gateway)</li>
              <li>☑️ RAG (pgvector-based retrieval from agricultural knowledge base)</li>
              <li>☑️ ML models (Vision AI for disease detection)</li>
              <li>☑️ Automation (Real-time weather alerts, scheduled farming reminders)</li>
            </ul>
            <h3 className="font-semibold mb-2">Tech Stack:</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium">Frontend</td><td>React 18, TypeScript, Tailwind CSS, Shadcn/UI, Vite, Mapbox GL</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Backend</td><td>Supabase (PostgreSQL, Auth, Edge Functions), Lovable Cloud</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">AI / ML</td><td>Google Gemini 2.5 Flash, pgvector for embeddings</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Data</td><td>PostgreSQL with RLS, pgvector for semantic search</td></tr>
                <tr><td className="py-2 font-medium">APIs</td><td>Open-Meteo (Weather), OpenStreetMap (Location), Mapbox (Maps)</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">7. Data Strategy</h2>
            <h3 className="font-semibold mb-2">Data Sources:</h3>
            <table className="w-full text-sm mb-4">
              <tbody>
                <tr className="border-b"><td className="py-1">BRRI & BARI</td><td>Bangladesh Rice/Agricultural Research Institute data</td></tr>
                <tr className="border-b"><td className="py-1">DAE</td><td>Department of Agricultural Extension guidelines</td></tr>
                <tr className="border-b"><td className="py-1">PlantVillage Dataset</td><td>Disease detection training data</td></tr>
                <tr className="border-b"><td className="py-1">Open-Meteo</td><td>Weather forecasting</td></tr>
                <tr className="border-b"><td className="py-1">SoilGrids</td><td>Soil quality data</td></tr>
                <tr><td className="py-1">FAO</td><td>International agricultural best practices</td></tr>
              </tbody>
            </table>
            <h3 className="font-semibold mb-2">Ethics & Privacy:</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground print:text-gray-700">
              <li>Row-Level Security (RLS) on all user data tables</li>
              <li>User data never shared with third parties</li>
              <li>Anonymous usage analytics only</li>
              <li>GDPR-compliant data handling practices</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">8. Demo & Proof of Work</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium w-1/3">Live Application</td><td><a href="https://agrishokti.aizanbd.com" className="text-primary underline">https://agrishokti.aizanbd.com</a></td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">9. Impact & Value</h2>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Who Benefits:</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground print:text-gray-700">
                <li><strong>Primary:</strong> 35+ million smallholder farmers in Bangladesh</li>
                <li><strong>Secondary:</strong> Agricultural extension officers, students, researchers, policymakers</li>
              </ul>
            </div>
            <h3 className="font-semibold mb-2">Expected Impact:</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-1">Disease Detection Time</td><td>From 2-3 days → &lt;1 minute</td></tr>
                <tr className="border-b"><td className="py-1">Crop Loss Reduction</td><td>Estimated 15-25% reduction</td></tr>
                <tr className="border-b"><td className="py-1">Expert Consultation</td><td>From 1:1500 ratio → Unlimited AI access</td></tr>
                <tr><td className="py-1">Cost Savings</td><td>৳5,000-10,000/farmer/year</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 10-11 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">10. Scalability & Sustainability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Scalability:</h3>
                <ul className="list-disc pl-5 text-muted-foreground print:text-gray-700">
                  <li>PWA works on any device</li>
                  <li>Serverless backend auto-scales</li>
                  <li>Extendable to India, Nepal, Sri Lanka</li>
                  <li>Multi-language architecture</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Revenue Model:</h3>
                <ul className="list-disc pl-5 text-muted-foreground print:text-gray-700">
                  <li>Freemium subscriptions (৳99/month)</li>
                  <li>B2B API for agri-companies</li>
                  <li>Government partnerships</li>
                  <li>Sponsored marketplace</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">12. Innovation Edge (10× Thinking)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground print:text-gray-700">
              <li><strong>First Bengali Voice-First Agricultural AI</strong> with RAG-powered accuracy</li>
              <li><strong>Unified Platform</strong> integrating disease detection + market + weather + community</li>
              <li><strong>RAG-Powered Accuracy</strong> with curated agricultural knowledge base</li>
              <li><strong>Offline-First PWA</strong> for rural areas with poor connectivity</li>
              <li><strong>Gamification</strong> for engagement with XP/achievement system</li>
              <li><strong>Anti-Fake Fertilizer Scanner</strong> combating ৳2,000 crore fake market</li>
            </ol>
          </section>

          {/* Section 14 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">14. Roadmap</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b"><th className="py-2 text-left">Phase</th><th className="text-left">Timeline</th><th className="text-left">Deliverables</th></tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium">Now (MVP)</td><td>Dec 2024</td><td>✅ Disease detection, Chat AI, Market, Weather, Calendar, PWA</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Next (Growth)</td><td>Q1-Q2 2025</td><td>SMS integration, IoT sensors, 5 Upazila pilot</td></tr>
                <tr><td className="py-2 font-medium">Future (Scale)</td><td>Q3-Q4 2025</td><td>India/Nepal expansion, 100k+ users</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 15-16 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">15. Open Source Declaration</h2>
            <table className="w-full text-sm mb-6">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium w-1/3">Open Source?</td><td>Yes</td></tr>
                <tr><td className="py-2 font-medium">License</td><td>MIT License</td></tr>
              </tbody>
            </table>

            <h2 className="text-xl font-bold border-b pb-2 mb-4">16. Final Checklist</h2>
            <ul className="list-none space-y-1 text-sm">
              <li>☑️ Naming convention correct (MXB2026-Mymensingh-TEAM_NEWBIES-AgriShokti)</li>
              <li>☑️ Demo accessible (https://agrishokti.aizanbd.com)</li>
              <li>☑️ AI logic explained (RAG pipeline with Gemini 2.5 Flash)</li>
              <li>☑️ Full technical documentation available</li>
              <li>☑️ Live working prototype deployed</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t mt-8">
            <p className="text-lg font-bold text-primary print:text-black">মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি 🌾</p>
            <p className="text-sm text-muted-foreground print:text-gray-600 mt-2">
              © 2024 TEAM_NEWBIES - AgriShokti
            </p>
          </div>
        </article>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:prose-black * { color: black !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-600 { color: #4b5563 !important; }
          .print\\:text-gray-700 { color: #374151 !important; }
          .print\\:bg-gray-100 { background-color: #f3f4f6 !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
};

export default SubmissionPage;
