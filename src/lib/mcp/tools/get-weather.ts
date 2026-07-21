import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_weather",
  title: "Get weather forecast",
  description:
    "Get current weather and short-term forecast for a location in Bangladesh (or anywhere) using Open-Meteo. Provide latitude and longitude.",
  inputSchema: {
    latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees."),
    longitude: z.number().min(-180).max(180).describe("Longitude in decimal degrees."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ latitude, longitude }) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
    );
    url.searchParams.set("timezone", "Asia/Dhaka");
    url.searchParams.set("forecast_days", "5");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      return {
        content: [{ type: "text", text: `Open-Meteo error ${res.status}: ${body}` }],
        isError: true,
      };
    }
    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  },
});
