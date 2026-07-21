import { defineMcp } from "@lovable.dev/mcp-js";
import aboutAppTool from "./tools/about-app";
import getWeatherTool from "./tools/get-weather";
import getFarmingTipTool from "./tools/farming-tip";

export default defineMcp({
  name: "agrishokti-mcp",
  title: "agriশক্তি MCP",
  version: "0.1.0",
  instructions:
    "Public tools for the agriশক্তি (Agri Shokti) Bangla-first agriculture app. Use `about_app` to introduce the app, `get_weather` for Open-Meteo forecasts by lat/lng, and `get_farming_tip` for a short Bangla tip by crop category.",
  tools: [aboutAppTool, getWeatherTool, getFarmingTipTool],
});
