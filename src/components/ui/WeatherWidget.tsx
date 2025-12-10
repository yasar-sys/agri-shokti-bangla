import { Cloud, Droplets, Wind, Sun, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  className?: string;
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  // Mock weather data - would come from GET /api/weather
  const weather = {
    temp: 28,
    condition: "আংশিক মেঘলা",
    humidity: 75,
    wind: 12,
    location: "ঢাকা, বাংলাদেশ",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        "bg-gradient-to-br from-card to-muted/50",
        "border border-border",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Sun className="w-full h-full text-primary" />
      </div>

      <div className="relative z-10">
        {/* Location */}
        <p className="text-sm text-muted-foreground mb-2">{weather.location}</p>

        {/* Temperature */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex items-start">
            <span className="text-5xl font-bold text-foreground">{weather.temp}</span>
            <span className="text-2xl text-muted-foreground">°C</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Cloud className="w-8 h-8 text-secondary" />
            <span className="text-sm text-muted-foreground">{weather.condition}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">আর্দ্রতা: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">বাতাস: {weather.wind} কি.মি./ঘ.</span>
          </div>
        </div>

        {/* API indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs text-muted-foreground">GET /api/weather • লাইভ</span>
        </div>
      </div>
    </div>
  );
}
