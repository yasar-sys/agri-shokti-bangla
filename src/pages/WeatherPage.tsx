import { useState, useEffect } from "react";
import { Droplets, Wind, Sun, Thermometer, Gauge, MapPin, ArrowLeft, Loader2, Cloud, CloudRain, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";

export default function WeatherPage() {
  const location = useLocation();
  const weather = useWeather(location.latitude, location.longitude);
  
  const [forecast, setForecast] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        );
        const data = await response.json();
        
        const weatherIcons: Record<number, string> = {
          0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
          51: '🌧️', 53: '🌧️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
          80: '🌦️', 81: '🌦️', 82: '⛈️', 95: '⛈️', 96: '🌨️', 99: '🌨️',
        };
        
        const days = ['আজ', 'আগামী', 'পরশু', '৩ দিন', '৪ দিন'];
        
        const forecastData = data.daily.time.slice(0, 5).map((date: string, i: number) => ({
          day: days[i],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: weatherIcons[data.daily.weather_code[i]] || '🌡️',
        }));
        
        setForecast(forecastData);
        setForecastLoading(false);
      } catch (error) {
        console.error('Forecast fetch error:', error);
        setForecastLoading(false);
      }
    };

    if (location.latitude && location.longitude && !location.loading) {
      fetchForecast();
    }
  }, [location.latitude, location.longitude, location.loading]);

  const soilData = {
    moisture: 65,
    ph: 6.5,
    nitrogen: "মধ্যম",
    recommendation: "মাটিতে আর্দ্রতা পর্যাপ্ত। সেচের প্রয়োজন নেই।",
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden bg-background">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative px-5 pt-6 pb-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-chart-3/50 to-transparent" />
        
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-border/50 hover:border-chart-3/50 transition-all shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              আবহাওয়া
              <Cloud className="w-5 h-5 text-chart-3" />
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-destructive" />
              {location.loading ? 'লোকেশন খুঁজছি...' : `${location.city}, ${location.country}`}
            </p>
          </div>
        </div>
      </header>

      {/* Current Weather Card */}
      <section className="px-5 mb-6">
        <div className="relative rounded-3xl overflow-hidden glass-card border border-border/50 shadow-elevated">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent" />
          
          <div className="relative p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
              <span>রিয়েল-টাইম আবহাওয়া</span>
            </div>

            {weather.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-chart-3/30 border-t-chart-3 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-start">
                      <span className="text-7xl font-bold text-foreground">{weather.temp}</span>
                      <span className="text-3xl text-muted-foreground mt-2">°C</span>
                    </div>
                    <p className="text-lg text-muted-foreground mt-1">{weather.conditionBn}</p>
                  </div>
                  <div className="text-7xl animate-float-slow">{weather.icon}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl glass-card border border-border/30">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">আর্দ্রতা</p>
                      <p className="font-bold text-foreground text-lg">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl glass-card border border-border/30">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Wind className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">বাতাস</p>
                      <p className="font-bold text-foreground text-lg">{weather.wind} <span className="text-xs font-normal">কি.মি./ঘ.</span></p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Forecast */}
      <section className="px-5 mb-6">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-chart-3" />
          আগামী দিনের পূর্বাভাস
        </h2>
        {forecastLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-chart-3 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {forecast.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "flex-shrink-0 w-[80px] p-4 rounded-2xl glass-card border text-center",
                  "transition-all duration-300 hover:scale-105",
                  index === 0 ? "border-chart-3/50 bg-chart-3/5" : "border-border/30"
                )}
              >
                <p className={cn(
                  "text-xs font-medium mb-2",
                  index === 0 ? "text-chart-3" : "text-muted-foreground"
                )}>{day.day}</p>
                <span className="text-3xl block mb-2">{day.icon}</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Soil Data */}
      <section className="px-5">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          মাটির তথ্য
        </h2>
        <div className="glass-card rounded-3xl p-5 border border-border/50">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
              <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase">আর্দ্রতা</p>
              <p className="font-bold text-foreground text-lg">{soilData.moisture}%</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
              <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase">pH</p>
              <p className="font-bold text-foreground text-lg">{soilData.ph}</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
              <Thermometer className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase">নাইট্রোজেন</p>
              <p className="font-bold text-foreground text-lg">{soilData.nitrogen}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">AI পরামর্শ</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{soilData.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
