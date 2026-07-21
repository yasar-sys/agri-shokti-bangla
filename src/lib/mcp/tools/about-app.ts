import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "about_app",
  title: "About agriশক্তি",
  description:
    "Returns a short description of the agriশক্তি (Agri Shokti) app — a Bangla-first AI agriculture assistant for Bangladeshi farmers.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "agriশক্তি (Agri Shokti) — মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি।",
          "",
          "A Bangla-first AI assistant for Bangladeshi farmers, combining:",
          "- Crop disease detection (Gemini Vision)",
          "- Fertilizer packet scanner",
          "- NPK / land / machine calculators",
          "- NDVI satellite field health (Sentinel-2 / Landsat via AgroMonitoring)",
          "- Market prices, weather alerts, pest heatmap",
          "- BARI/BRRI-grounded RAG knowledge base",
          "",
          "Public site: https://agri-shokti-bangla.lovable.app",
        ].join("\n"),
      },
    ],
  }),
});
