import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SUPABASE_URL = "https://yojlbxpbxfskcfzfoghs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvamxieHBieGZza2NmemZvZ2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDE2NjksImV4cCI6MjA4MTAxNzY2OX0.5imSdia4p717cVqBQctC0fmOtcpg3yoZiWEnrS3tC9g";

export default defineTool({
  name: "get_market_prices",
  title: "Get market prices",
  description:
    "Fetch today's fresh bazaar prices for crops, vegetables, fish, poultry, and livestock in Bangladesh — including yesterday's price and day-over-day change. Optional filter by crop name (Bangla or English substring).",
  inputSchema: {
    crop: z
      .string()
      .nullable()
      .describe(
        "Optional crop/item name filter (substring match, e.g. 'ধান', 'rice', 'ইলিশ'). Pass null for all items.",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .nullable()
      .describe("Max rows to return (default 50). Pass null for default."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ crop, limit }) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/market_prices`);
    url.searchParams.set(
      "select",
      "crop_name,crop_emoji,today_price,yesterday_price,weekly_avg,forecast_price,unit,market_location,forecast,confidence,updated_at",
    );
    url.searchParams.set("order", "updated_at.desc");
    url.searchParams.set("limit", String(limit ?? 50));
    if (crop && crop.trim()) {
      url.searchParams.set("crop_name", `ilike.*${crop.trim()}*`);
    }

    const res = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        content: [{ type: "text", text: `Market prices error ${res.status}: ${body}` }],
        isError: true,
      };
    }

    const rows: Array<{
      crop_name: string;
      crop_emoji: string | null;
      today_price: number | null;
      yesterday_price: number | null;
      weekly_avg: number | null;
      forecast_price: number | null;
      unit: string | null;
      market_location: string | null;
      forecast: string | null;
      confidence: number | null;
      updated_at: string;
    }> = await res.json();

    const items = rows.map((r) => {
      const today = Number(r.today_price ?? 0);
      const yest = Number(r.yesterday_price ?? 0);
      const change = today - yest;
      const changePct = yest ? (change / yest) * 100 : 0;
      return {
        crop: r.crop_name,
        emoji: r.crop_emoji,
        today_price: today,
        yesterday_price: yest,
        change,
        change_pct: Number(changePct.toFixed(2)),
        weekly_avg: r.weekly_avg,
        forecast_price: r.forecast_price,
        forecast: r.forecast,
        confidence: r.confidence,
        unit: r.unit,
        market: r.market_location,
        updated_at: r.updated_at,
      };
    });

    const summary = items
      .map(
        (i) =>
          `${i.emoji ?? ""} ${i.crop}: আজ ৳${i.today_price}/${i.unit ?? ""} · গতকাল ৳${i.yesterday_price} · পরিবর্তন ${i.change >= 0 ? "+" : ""}${i.change} (${i.change_pct}%)${i.market ? ` · ${i.market}` : ""}`,
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: summary || "No market prices found for that filter.",
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
