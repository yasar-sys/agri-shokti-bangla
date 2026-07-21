import { defineMcp } from "@lovable.dev/mcp-js";
import aboutAppTool from "./tools/about-app";
import getWeatherTool from "./tools/get-weather";
import getFarmingTipTool from "./tools/farming-tip";
import getMarketPricesTool from "./tools/market-prices";

export default defineMcp({
  name: "agrishokti-mcp",
  title: "agriশক্তি MCP",
  version: "0.2.0",
  instructions:
    "Public tools for the agriশক্তি (Agri Shokti) Bangla-first agriculture app. Use `about_app` to introduce the app, `get_weather` for Open-Meteo forecasts by lat/lng, `get_farming_tip` for a short Bangla tip by crop category, and `get_market_prices` for today's/yesterday's bazaar prices (crops, vegetables, fish, poultry, livestock) with day-over-day change — call this whenever the user asks about দাম / বাজার / market price.",
  tools: [aboutAppTool, getWeatherTool, getFarmingTipTool, getMarketPricesTool],
});

