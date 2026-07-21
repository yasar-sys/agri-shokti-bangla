import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TIPS: Record<string, string[]> = {
  rice: [
    "বোরো মৌসুমে রোপণের ২০-২৫ দিন পর ইউরিয়ার প্রথম কিস্তি প্রয়োগ করুন।",
    "ধানের ব্লাস্ট রোগ প্রতিরোধে সহনশীল জাত (ব্রি ধান২৮, ৮৯) ব্যবহার করুন।",
    "সেচের পানি জমিতে ৫-৭ সেমি রাখুন, বেশি নয়।",
  ],
  wheat: [
    "গমের বীজ বপনের সর্বোত্তম সময়: ১৫ নভেম্বর - ৩০ নভেম্বর।",
    "বীজ বপনের ২১ দিন পর প্রথম সেচ দিন।",
  ],
  jute: [
    "পাটের বীজ বপনের আগে সারিতে সারিতে বীজ শোধন করুন।",
    "চারা গজানোর ২৫-৩০ দিনের মধ্যে বিরল করা দরকার।",
  ],
  vegetable: [
    "সবজি ক্ষেতে জৈব সার (কম্পোস্ট) ব্যবহার মাটির স্বাস্থ্য ভালো রাখে।",
    "টমেটোর নাবি ধ্বসা রোগ প্রতিরোধে সকালে সেচ দিন, বিকেলে নয়।",
  ],
};

export default defineTool({
  name: "get_farming_tip",
  title: "Get farming tip",
  description:
    "Return a short Bangla farming tip for a given crop category. Categories: rice, wheat, jute, vegetable.",
  inputSchema: {
    crop: z
      .enum(["rice", "wheat", "jute", "vegetable"])
      .describe("Crop category to get a tip for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: ({ crop }) => {
    const list = TIPS[crop] ?? [];
    const tip = list[Math.floor(Math.random() * list.length)] ?? "কোনো টিপ পাওয়া যায়নি।";
    return {
      content: [{ type: "text", text: tip }],
      structuredContent: { crop, tip },
    };
  },
});
