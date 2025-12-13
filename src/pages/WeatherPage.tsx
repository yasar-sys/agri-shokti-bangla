import { useState, useEffect } from "react";
import { Droplets, Wind, Sun, Thermometer, Gauge, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

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
        
        const days = ['আজ', 'আগামীকাল', 'পরশু', '৩ দিন পরে', '৪ দিন পরে'];
        
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
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Link
          to="/home"
          className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">আবহাওয়া ও মাটি</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location.loading ? 'লোকেশন খুঁজছি...' : `${location.city}, ${location.country}`}
          </p>
        </div>
      </header>

      {/* Current Weather */}
      <section className="px-4 mb-6">
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <Sun className="w-full h-full text-primary" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>রিয়েল-টাইম আবহাওয়া</span>
            </div>

            {weather.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-start">
                      <span className="text-6xl font-bold text-foreground">{weather.temp}</span>
                      <span className="text-2xl text-muted-foreground mt-2">°C</span>
                    </div>
                    <p className="text-lg text-muted-foreground mt-1">{weather.conditionBn}</p>
                  </div>
                  <span className="text-6xl">{weather.icon}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Droplets className="w-6 h-6 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
                      <p className="font-semibold text-foreground">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Wind className="w-6 h-6 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">বাতাস</p>
                      <p className="font-semibold text-foreground">{weather.wind} কি.মি./ঘ.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Forecast */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">আগামী দিনের পূর্বাভাস</h2>
        {forecastLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="flex-1 min-w-[70px] p-3 rounded-xl bg-card border border-border text-center"
              >
                <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                <span className="text-2xl">{day.icon}</span>
                <div className="mt-2">
                  <p className="font-semibold text-foreground text-sm">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Soil Data */}
      <section className="px-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">মাটির তথ্য</h2>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Droplets className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
              <p className="font-semibold text-foreground">{soilData.moisture}%</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">pH</p>
              <p className="font-semibold text-foreground">{soilData.ph}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Thermometer className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">নাইট্রোজেন</p>
              <p className="font-semibold text-foreground">{soilData.nitrogen}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <p className="text-sm text-foreground">
              <strong>AI পরামর্শ:</strong> {soilData.recommendation}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
